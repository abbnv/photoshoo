export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import { prisma } from '@/lib/prisma';
import { addTokens } from '@/lib/token-balance';

interface LavaWebhookPayload {
  eventType?: string;
  contractId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

function parseBasicAuth(header: string | null): { login: string; password: string } | null {
  if (!header || !header.startsWith('Basic ')) {
    return null;
  }

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex < 0) {
      return null;
    }

    return {
      login: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const adminConfig = await getRuntimeAdminConfig();
  const expectedApiKey = adminConfig.lavaWebhookApiKey;
  const expectedBasicLogin = adminConfig.lavaWebhookBasicLogin;
  const expectedBasicPassword = adminConfig.lavaWebhookBasicPassword;

  if (expectedBasicLogin || expectedBasicPassword) {
    const credentials = parseBasicAuth(request.headers.get('authorization'));
    if (
      !credentials ||
      credentials.login !== expectedBasicLogin ||
      credentials.password !== expectedBasicPassword
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (expectedApiKey) {
    const headerApiKey = request.headers.get('x-api-key');
    if (!headerApiKey || headerApiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const payload = (await request.json().catch(() => ({}))) as LavaWebhookPayload;
  const eventType = String(payload?.eventType ?? '');
  const contractId = String(payload?.contractId ?? '');
  if (!contractId) {
    return NextResponse.json({ error: 'contractId is required' }, { status: 400 });
  }

  const payment = await prisma.billingPayment.findUnique({
    where: { lavaContractId: contractId },
  });

  if (!payment) {
    return NextResponse.json({ ok: true });
  }

  if (eventType === 'payment.success') {
    if (payment.status !== 'completed') {
      await addTokens(payment.userId, payment.tokens, 'purchase', {
        contractId,
        tariffKey: payment.tariffKey,
      });

      await prisma.billingPayment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          amountMinor: Number.isFinite(Number(payload.amount))
            ? Math.round(Number(payload.amount) * 100)
            : payment.amountMinor,
          currency: String(payload.currency ?? payment.currency ?? ''),
          rawPayload: payload as unknown as object,
        },
      });
    }

    return NextResponse.json({ ok: true });
  }

  if (eventType === 'payment.failed') {
    await prisma.billingPayment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        processedAt: new Date(),
        rawPayload: payload as unknown as object,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
