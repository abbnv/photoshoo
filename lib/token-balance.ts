import { prisma } from '@/lib/prisma';

export class InsufficientTokensError extends Error {
  balance: number;

  constructor(balance: number) {
    super('Недостаточно токенов');
    this.balance = balance;
  }
}

export async function getUserTokenBalance(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true },
  });
  return user?.tokenBalance ?? 0;
}

export async function consumeTokensOrThrow(
  userId: number,
  amount: number,
  reason: string,
  meta?: Record<string, unknown>
): Promise<number> {
  const debitAmount = Math.max(1, Math.round(amount));

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: {
        id: userId,
        tokenBalance: { gte: debitAmount },
      },
      data: {
        tokenBalance: { decrement: debitAmount },
      },
    });

    if (updated.count === 0) {
      const current = await tx.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
      });
      throw new InsufficientTokensError(current?.tokenBalance ?? 0);
    }

    const next = await tx.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    await tx.tokenTransaction.create({
      data: {
        userId,
        delta: -debitAmount,
        reason,
        meta: meta ? (meta as any) : undefined,
      },
    });

    return next?.tokenBalance ?? 0;
  });
}

export async function addTokens(
  userId: number,
  amount: number,
  reason: string,
  meta?: Record<string, unknown>
): Promise<number> {
  const creditAmount = Math.max(1, Math.round(amount));

  return prisma.$transaction(async (tx) => {
    const next = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: creditAmount },
      },
      select: { tokenBalance: true },
    });

    await tx.tokenTransaction.create({
      data: {
        userId,
        delta: creditAmount,
        reason,
        meta: meta ? (meta as any) : undefined,
      },
    });

    return next.tokenBalance;
  });
}
