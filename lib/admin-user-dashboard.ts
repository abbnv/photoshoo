import { prisma } from '@/lib/prisma';

export interface AdminUserDashboardSummary {
  totalUsers: number;
  newUsersLast7Days: number;
  totalGeneratedImages: number;
  successfulPayments: number;
  purchasedTokens: number;
  spentTokens: number;
}

export interface AdminUserDashboardRow {
  userId: number;
  email: string;
  name: string | null;
  createdAt: Date;
  tokenBalance: number;
  generatedImagesCount: number;
  spentTokens: number;
  purchasedTokens: number;
  successfulPaymentsCount: number;
  paymentTotals: string[];
  lastActivityAt: Date;
}

export interface AdminUserDashboardData {
  summary: AdminUserDashboardSummary;
  users: AdminUserDashboardRow[];
}

interface TokenAggRow {
  userId: number;
  spentTokens: number;
  purchasedTokens: number;
  lastTokenActivityAt: Date | null;
}

interface GeneratedAggRow {
  userId: number;
  generatedImagesCount: number;
  lastGeneratedAt: Date | null;
}

interface PaymentAggRow {
  userId: number;
  successfulPaymentsCount: number;
  successfulPaymentTokens: number;
  lastPaymentAt: Date | null;
}

interface PaymentCurrencyAggRow {
  userId: number;
  currency: string;
  amountMinorTotal: number;
}

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatAmountMinor(amountMinorTotal: number, currency: string): string {
  const amount = amountMinorTotal / 100;
  const formatted = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.?0+$/, '');

  return currency ? `${formatted} ${currency}` : formatted;
}

export async function getAdminUserDashboardData(): Promise<AdminUserDashboardData> {
  const now = new Date();
  const newUsersThreshold = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

  const [users, tokenAgg, generatedAgg, paymentAgg, paymentCurrencyAgg] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        tokenBalance: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.$queryRaw<TokenAggRow[]>`
      SELECT
        tt.user_id AS "userId",
        COALESCE(SUM(CASE WHEN tt.delta < 0 AND tt.reason IN ('generation', 'variation') THEN -tt.delta ELSE 0 END), 0)::int AS "spentTokens",
        COALESCE(SUM(CASE WHEN tt.delta > 0 AND tt.reason = 'purchase' THEN tt.delta ELSE 0 END), 0)::int AS "purchasedTokens",
        MAX(CASE WHEN tt.reason IN ('generation', 'variation', 'purchase') THEN tt.created_at ELSE NULL END) AS "lastTokenActivityAt"
      FROM token_transactions tt
      GROUP BY tt.user_id
    `,
    prisma.$queryRaw<GeneratedAggRow[]>`
      SELECT
        p.user_id AS "userId",
        COUNT(gi.id)::int AS "generatedImagesCount",
        MAX(gi.created_at) AS "lastGeneratedAt"
      FROM photoshoots p
      LEFT JOIN generated_images gi ON gi.photoshoot_id = p.id
      GROUP BY p.user_id
    `,
    prisma.$queryRaw<PaymentAggRow[]>`
      SELECT
        bp.user_id AS "userId",
        COUNT(*) FILTER (WHERE bp.status = 'completed')::int AS "successfulPaymentsCount",
        COALESCE(SUM(bp.tokens) FILTER (WHERE bp.status = 'completed'), 0)::int AS "successfulPaymentTokens",
        MAX(COALESCE(bp.processed_at, bp.created_at)) FILTER (WHERE bp.status = 'completed') AS "lastPaymentAt"
      FROM billing_payments bp
      GROUP BY bp.user_id
    `,
    prisma.$queryRaw<PaymentCurrencyAggRow[]>`
      SELECT
        bp.user_id AS "userId",
        UPPER(COALESCE(bp.currency, '')) AS currency,
        SUM(bp.amount_minor)::int AS "amountMinorTotal"
      FROM billing_payments bp
      WHERE bp.status = 'completed'
        AND bp.amount_minor IS NOT NULL
      GROUP BY bp.user_id, UPPER(COALESCE(bp.currency, ''))
    `,
  ]);

  const tokenMap = new Map(tokenAgg.map((row) => [row.userId, row]));
  const generatedMap = new Map(generatedAgg.map((row) => [row.userId, row]));
  const paymentMap = new Map(paymentAgg.map((row) => [row.userId, row]));
  const paymentTotalsMap = new Map<number, string[]>();

  for (const row of paymentCurrencyAgg) {
    const totals = paymentTotalsMap.get(row.userId) ?? [];
    totals.push(formatAmountMinor(row.amountMinorTotal, row.currency));
    paymentTotalsMap.set(row.userId, totals.sort((a, b) => a.localeCompare(b)));
  }

  const dashboardUsers = users
    .map<AdminUserDashboardRow>((user) => {
      const tokenStats = tokenMap.get(user.id);
      const generatedStats = generatedMap.get(user.id);
      const paymentStats = paymentMap.get(user.id);
      const lastActivityCandidates = [
        user.createdAt,
        asDate(tokenStats?.lastTokenActivityAt),
        asDate(generatedStats?.lastGeneratedAt),
        asDate(paymentStats?.lastPaymentAt),
      ].filter((value): value is Date => value instanceof Date);
      const lastActivityAt = new Date(
        Math.max(...lastActivityCandidates.map((value) => value.getTime()))
      );

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        tokenBalance: user.tokenBalance,
        generatedImagesCount: generatedStats?.generatedImagesCount ?? 0,
        spentTokens: tokenStats?.spentTokens ?? 0,
        purchasedTokens: paymentStats
          ? paymentStats.successfulPaymentTokens
          : tokenStats?.purchasedTokens ?? 0,
        successfulPaymentsCount: paymentStats?.successfulPaymentsCount ?? 0,
        paymentTotals: paymentTotalsMap.get(user.id) ?? [],
        lastActivityAt,
      };
    })
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

  const summary = dashboardUsers.reduce<AdminUserDashboardSummary>(
    (acc, user) => {
      acc.totalUsers += 1;
      acc.totalGeneratedImages += user.generatedImagesCount;
      acc.successfulPayments += user.successfulPaymentsCount;
      acc.purchasedTokens += user.purchasedTokens;
      acc.spentTokens += user.spentTokens;
      if (user.createdAt >= newUsersThreshold) {
        acc.newUsersLast7Days += 1;
      }
      return acc;
    },
    {
      totalUsers: 0,
      newUsersLast7Days: 0,
      totalGeneratedImages: 0,
      successfulPayments: 0,
      purchasedTokens: 0,
      spentTokens: 0,
    }
  );

  return {
    summary,
    users: dashboardUsers,
  };
}
