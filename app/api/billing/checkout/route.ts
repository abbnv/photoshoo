export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import { createLavaInvoice } from '@/lib/lava';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number((session.user as any)?.id);
  const email = String(session.user.email ?? '').trim();
  if (!Number.isFinite(userId) || !email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tariffKey = String(body?.tariffKey ?? '').trim();
  if (!tariffKey) {
    return NextResponse.json({ error: 'tariffKey is required' }, { status: 400 });
  }

  const adminConfig = await getRuntimeAdminConfig();
  if (!adminConfig.lavaApiKey) {
    return NextResponse.json({ error: 'Lava API key is not configured in admin' }, { status: 400 });
  }

  const tariff = adminConfig.billingConfig.tariffs.find((item) => item.enabled && item.key === tariffKey);
  if (!tariff) {
    return NextResponse.json({ error: 'Tariff not found' }, { status: 404 });
  }
  if (!tariff.offerId) {
    return NextResponse.json({ error: 'Tariff offerId is empty in admin config' }, { status: 400 });
  }

  const invoice = await createLavaInvoice({
    apiKey: adminConfig.lavaApiKey,
    email,
    offerId: tariff.offerId,
    currency: tariff.currency,
  });

  await prisma.billingPayment.upsert({
    where: { lavaContractId: invoice.id },
    update: {
      status: 'pending',
      userId,
      tariffKey: tariff.key,
      tariffLabel: tariff.label,
      offerId: tariff.offerId,
      tokens: tariff.tokens,
      currency: tariff.currency,
      rawPayload: invoice as unknown as object,
    },
    create: {
      userId,
      lavaContractId: invoice.id,
      tariffKey: tariff.key,
      tariffLabel: tariff.label,
      offerId: tariff.offerId,
      tokens: tariff.tokens,
      currency: tariff.currency,
      status: 'pending',
      rawPayload: invoice as unknown as object,
    },
  });

  return NextResponse.json({
    paymentUrl: invoice.paymentUrl,
    contractId: invoice.id,
  });
}
