export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number((session.user as any)?.id);

    const photoshoots = await prisma.photoshoot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        generatedImages: { take: 4, orderBy: { createdAt: 'asc' } },
        _count: { select: { generatedImages: true } },
      },
    });

    const result = await Promise.all(
      (photoshoots ?? []).map(async (ps) => {
        let thumbnail: string | undefined;
        const previewImages: string[] = [];
        const firstImg = ps?.generatedImages?.[0];
        if (firstImg?.cloudStoragePath) {
          try {
            thumbnail = await getFileUrl(firstImg.cloudStoragePath, firstImg?.isPublic ?? true);
          } catch {}
        } else if (firstImg?.url) {
          thumbnail = firstImg.url;
        }

        for (const img of ps?.generatedImages ?? []) {
          let resolvedUrl: string | undefined;
          if (img?.cloudStoragePath) {
            try {
              resolvedUrl = await getFileUrl(img.cloudStoragePath, img?.isPublic ?? true);
            } catch {}
          } else if (img?.url) {
            resolvedUrl = img.url;
          }

          if (resolvedUrl) {
            previewImages.push(resolvedUrl);
          }
        }

        return {
          id: ps?.id,
          title: ps?.title ?? 'Untitled',
          status: ps?.status ?? 'draft',
          createdAt: ps?.createdAt?.toISOString?.() ?? '',
          thumbnail,
          previewImages,
          imageCount: ps?._count?.generatedImages ?? 0,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get photoshoots error:', error);
    return NextResponse.json({ error: 'Failed to fetch photoshoots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number((session.user as any)?.id);
    const body = await request.json();

    const photoshoot = await prisma.photoshoot.create({
      data: {
        userId,
        title: body?.title ?? 'New Photoshoot',
        status: 'draft',
      },
    });

    return NextResponse.json({ id: photoshoot.id, title: photoshoot.title, status: photoshoot.status }, { status: 201 });
  } catch (error: any) {
    console.error('Create photoshoot error:', error);
    return NextResponse.json({ error: 'Failed to create photoshoot' }, { status: 500 });
  }
}
