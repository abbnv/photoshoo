import { mkdir, unlink } from 'fs/promises';
import path from 'path';

export function getStorageRootPath(): string {
  return process.env.STORAGE_ROOT?.trim() || path.join(process.cwd(), 'storage');
}

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic: boolean = false
): Promise<{ uploadUrl: string; cloud_storage_path: string }> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const extFromType = contentType?.split('/')?.[1] ? `.${contentType.split('/')[1]}` : '';
  const hasExt = /\.[a-zA-Z0-9]+$/.test(safeName);
  const finalName = hasExt ? safeName : `${safeName}${extFromType}`;
  const prefix = isPublic ? 'public/uploads' : 'uploads';
  const cloud_storage_path = `${prefix}/${Date.now()}-${finalName}`;
  const uploadUrl = `/api/storage?path=${encodeURIComponent(cloud_storage_path)}`;
  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(cloud_storage_path: string, isPublic: boolean = false): Promise<string> {
  const query = encodeURIComponent(cloud_storage_path);
  return `/api/storage?path=${query}&public=${isPublic ? '1' : '0'}`;
}

export async function deleteFile(cloud_storage_path: string): Promise<void> {
  const root = getStorageRootPath();
  const fullPath = path.join(root, cloud_storage_path);
  try {
    await unlink(fullPath);
  } catch {
    // Ignore missing files to keep API idempotent.
  }
}

export async function ensureStorageRoot(): Promise<string> {
  const root = getStorageRootPath();
  await mkdir(root, { recursive: true });
  return root;
}
