export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { deleteFile, getFileUrl } from '@/lib/s3';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number((session.user as any)?.id);
    const photoshootId = Number(params?.id);

    const ps = await prisma.photoshoot.findFirst({
      where: { id: photoshootId, userId },
      include: {
        sourceImages: { orderBy: { fileOrder: 'asc' } },
        generatedImages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ps) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Resolve URLs
    const sourceImages = await Promise.all(
      (ps?.sourceImages ?? []).map(async (img) => {
        let url = img?.url ?? '';
        if (img?.cloudStoragePath) {
          try { url = await getFileUrl(img.cloudStoragePath, img?.isPublic ?? true); } catch {}
        }
        return { id: img?.id, url };
      })
    );

    const generatedImages = await Promise.all(
      (ps?.generatedImages ?? []).map(async (img) => {
        let url = img?.url ?? '';
        if (img?.cloudStoragePath) {
          try { url = await getFileUrl(img.cloudStoragePath, img?.isPublic ?? true); } catch {}
        }
        return { id: img?.id, url, prompt: img?.prompt ?? '' };
      })
    );

    return NextResponse.json({
      id: ps.id,
      title: ps?.title ?? 'Untitled',
      status: ps?.status ?? 'draft',
      quizAnswers: ps?.quizAnswers ?? null,
      createdAt: ps?.createdAt?.toISOString?.() ?? '',
      sourceImages,
      generatedImages,
    });
  } catch (error: any) {
    console.error('Get photoshoot error:', error);
    return NextResponse.json({ error: 'Failed to fetch photoshoot' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any)?.id);
    const photoshootId = Number(params?.id);
    if (!Number.isFinite(photoshootId)) {
      return NextResponse.json({ error: 'Invalid photoshoot id' }, { status: 400 });
    }

    const ps = await prisma.photoshoot.findFirst({
      where: { id: photoshootId, userId },
      select: {
        id: true,
        sourceImages: { select: { cloudStoragePath: true } },
        generatedImages: { select: { cloudStoragePath: true } },
      },
    });

    if (!ps) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const filesToDelete = [
      ...(ps.sourceImages ?? []),
      ...(ps.generatedImages ?? []),
    ]
      .map((image) => image?.cloudStoragePath)
      .filter((filePath): filePath is string => Boolean(filePath));

    await Promise.all(filesToDelete.map((filePath) => deleteFile(filePath)));
    await prisma.photoshoot.delete({ where: { id: ps.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete photoshoot error:', error);
    return NextResponse.json({ error: 'Failed to delete photoshoot' }, { status: 500 });
  }
}
