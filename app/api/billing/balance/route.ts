export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import { getUserTokenBalance } from '@/lib/token-balance';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number((session.user as any)?.id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [balance, adminConfig] = await Promise.all([
    getUserTokenBalance(userId),
    getRuntimeAdminConfig(),
  ]);

  return NextResponse.json({
    balance,
    tokenCostPerGeneration: adminConfig.billingConfig.tokenCostPerGeneration,
  });
}
