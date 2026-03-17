const BILLING_CHECKOUT_PENDING_KEY = 'billing-checkout-pending-until';
const BILLING_BALANCE_REFRESH_KEY = 'billing-balance-refresh-at';

const DEFAULT_CHECKOUT_PENDING_MS = 10 * 60 * 1000;

function getStoredTimestamp(key: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  const timestamp = Number(rawValue);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

export function getBillingCheckoutPendingUntil() {
  const timestamp = getStoredTimestamp(BILLING_CHECKOUT_PENDING_KEY);
  if (!timestamp) {
    return null;
  }

  if (timestamp <= Date.now()) {
    window.localStorage.removeItem(BILLING_CHECKOUT_PENDING_KEY);
    return null;
  }

  return timestamp;
}

export function markBillingCheckoutPending(durationMs = DEFAULT_CHECKOUT_PENDING_MS) {
  if (typeof window === 'undefined') {
    return null;
  }

  const pendingUntil = Date.now() + durationMs;
  window.localStorage.setItem(BILLING_CHECKOUT_PENDING_KEY, String(pendingUntil));
  return pendingUntil;
}

export function clearBillingCheckoutPending() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(BILLING_CHECKOUT_PENDING_KEY);
}

export function notifyBillingBalanceRefresh() {
  if (typeof window === 'undefined') {
    return;
  }

  const timestamp = String(Date.now());
  window.localStorage.setItem(BILLING_BALANCE_REFRESH_KEY, timestamp);
  window.dispatchEvent(new Event(BILLING_BALANCE_REFRESH_KEY));
}

export function subscribeToBillingRefresh(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === BILLING_CHECKOUT_PENDING_KEY ||
      event.key === BILLING_BALANCE_REFRESH_KEY
    ) {
      callback();
    }
  };

  window.addEventListener(BILLING_BALANCE_REFRESH_KEY, callback);
  window.addEventListener('focus', callback);
  window.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(BILLING_BALANCE_REFRESH_KEY, callback);
    window.removeEventListener('focus', callback);
    window.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('storage', handleStorage);
  };
}
