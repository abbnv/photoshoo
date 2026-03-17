export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getRuntimeAdminConfig } from '@/lib/admin-config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, acceptedLegal } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (acceptedLegal !== true) {
      return NextResponse.json(
        { error: 'You must accept the privacy policy and user agreement' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const adminConfig = await getRuntimeAdminConfig();
    const trialGenerations = Math.max(0, Math.round(adminConfig.billingConfig.trialGenerations ?? 10));

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name ?? '', tokenBalance: trialGenerations },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
