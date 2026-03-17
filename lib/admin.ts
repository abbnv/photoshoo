const ADMIN_CONFIG_KEY = 'default';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return getAdminEmails().includes(normalized);
}

export { ADMIN_CONFIG_KEY };
