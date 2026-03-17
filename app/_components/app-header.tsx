'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Camera, Coins, CreditCard, LogOut, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  clearBillingCheckoutPending,
  getBillingCheckoutPendingUntil,
  notifyBillingBalanceRefresh,
  subscribeToBillingRefresh,
} from '@/lib/billing-browser';

export default function AppHeader() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const isAdmin = (session?.user as any)?.isAdmin === true;
  const [balance, setBalance] = useState<number | null>(null);
  const [pendingCheckoutUntil, setPendingCheckoutUntil] = useState<number | null>(null);
  const balanceRef = useRef<number | null>(null);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    if (!session?.user) {
      setBalance(null);
      setPendingCheckoutUntil(null);
      return;
    }

    let active = true;
    const loadBalance = async () => {
      try {
        const response = await fetch('/api/billing/balance', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) {
          const nextBalance = Number(payload?.balance ?? 0);
          if (pendingCheckoutUntil && balanceRef.current != null && nextBalance > balanceRef.current) {
            clearBillingCheckoutPending();
            setPendingCheckoutUntil(null);
            notifyBillingBalanceRefresh();
          }

          setBalance(nextBalance);
        }
      } catch {}
    };

    setPendingCheckoutUntil(getBillingCheckoutPendingUntil());
    loadBalance();
    const intervalId = window.setInterval(loadBalance, pendingCheckoutUntil ? 3000 : 12000);
    const unsubscribe = subscribeToBillingRefresh(() => {
      setPendingCheckoutUntil(getBillingCheckoutPendingUntil());
      void loadBalance();
    });
    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [pendingCheckoutUntil, session?.user]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => router.push('/photoshoots')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Camera className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">AI Фотосессия</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/billing')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 transition hover:bg-zinc-800"
            title="Баланс токенов"
          >
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            {balance == null ? '...' : balance}
          </button>
          <Button size="sm" variant="outline" onClick={() => router.push('/billing')} className="gap-1">
            <CreditCard className="w-4 h-4" /> Оплата
          </Button>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => router.push('/admin')} className="gap-1">
              <Shield className="w-4 h-4" /> Админка
            </Button>
          )}
          <Button size="sm" onClick={() => router.push('/photoshoots/new')} className="gap-1">
            <Plus className="w-4 h-4" /> Новая съёмка
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:block">
            {session?.user?.name ?? session?.user?.email ?? ''}
          </span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
