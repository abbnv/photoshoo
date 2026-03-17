export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number((session.user as any)?.id);
    const body = await request.json();
    const { photoshootId, cloud_storage_path, isPublic, fileOrder } = body ?? {};

    if (!photoshootId || !cloud_storage_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const ps = await prisma.photoshoot.findFirst({ where: { id: photoshootId, userId } });
    if (!ps) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const url = await getFileUrl(cloud_storage_path, isPublic ?? true);

    await prisma.sourceImage.create({
      data: {
        photoshootId,
        url,
        cloudStoragePath: cloud_storage_path,
        isPublic: isPublic ?? true,
        fileOrder: fileOrder ?? 0,
      },
    });

    return NextResponse.json({ url, cloud_storage_path });
  } catch (error: any) {
    console.error('Upload complete error:', error);
    return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
  }
}
