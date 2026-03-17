export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ensureStorageRoot } from '@/lib/s3';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

function resolveSafePath(root: string, relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '');
  const fullPath = path.resolve(root, normalized);
  const normalizedRoot = `${path.resolve(root)}${path.sep}`;
  if (!fullPath.startsWith(normalizedRoot)) {
    throw new Error('Invalid path');
  }
  return fullPath;
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const relativePath = url.searchParams.get('path') ?? '';
    if (!relativePath) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    const root = await ensureStorageRoot();
    const fullPath = resolveSafePath(root, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, Buffer.from(await request.arrayBuffer()));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const relativePath = url.searchParams.get('path') ?? '';
    if (!relativePath) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    const root = await ensureStorageRoot();
    const fullPath = resolveSafePath(root, relativePath);
    const file = await readFile(fullPath);
    return new Response(file, {
      headers: {
        'Content-Type': getContentType(fullPath),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
