export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number((session.user as any)?.id);
    const photoshootId = Number(params?.id);

    const ps = await prisma.photoshoot.findFirst({ where: { id: photoshootId, userId } });
    if (!ps) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const updated = await prisma.photoshoot.update({
      where: { id: photoshootId },
      data: { quizAnswers: body?.quizAnswers ?? {} },
    });

    return NextResponse.json({ success: true, quizAnswers: updated?.quizAnswers });
  } catch (error: any) {
    console.error('Update quiz error:', error);
    return NextResponse.json({ error: 'Failed to save quiz answers' }, { status: 500 });
  }
}
