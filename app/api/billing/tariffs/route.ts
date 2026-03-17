export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getRuntimeAdminConfig } from '@/lib/admin-config';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminConfig = await getRuntimeAdminConfig();
  const tariffs = adminConfig.billingConfig.tariffs
    .filter((item) => item.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return NextResponse.json({
    trialGenerations: adminConfig.billingConfig.trialGenerations,
    tokenCostPerGeneration: adminConfig.billingConfig.tokenCostPerGeneration,
    tariffs,
  });
}
