'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StepUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  initialPhotoshootId?: number | null;
  initialUrls?: string[];
  onComplete: (photoshootId: number, urls: string[]) => void;
}

export default function StepUpload({
  files,
  setFiles,
  initialPhotoshootId = null,
  initialUrls = [],
  onComplete,
}: StepUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const MAX_FILES = 3;

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles ?? []);
    const imageFiles = fileArray.filter((f) => f?.type?.startsWith?.('image/'));
    if (imageFiles.length < fileArray.length) {
      toast.error('Принимаются только изображения');
    }
    const total = (files?.length ?? 0) + imageFiles.length;
    if (total > MAX_FILES) {
      toast.error(`Максимум ${MAX_FILES} изображения`);
      return;
    }
    const updated = [...(files ?? []), ...imageFiles];
    setFiles(updated);
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...(prev ?? []), ...newPreviews]);
  }, [files, setFiles]);

  const removeFile = useCallback((index: number) => {
    const updated = [...(files ?? [])].filter((_, i) => i !== index);
    setFiles(updated);
    setPreviews((prev) => {
      const p = [...(prev ?? [])];
      if (p[index]) URL.revokeObjectURL(p[index]);
      return p.filter((_, i) => i !== index);
    });
  }, [files, setFiles]);

  useEffect(() => {
    if ((files?.length ?? 0) > 0) {
      const objectUrls = files.map((file) => URL.createObjectURL(file));
      setPreviews(objectUrls);

      return () => {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }

    setPreviews(initialUrls);
  }, [files, initialUrls]);

  const handleUpload = async () => {
    if ((files?.length ?? 0) === 0 && (initialUrls?.length ?? 0) === 0) {
      toast.error('Загрузите хотя бы 1 изображение');
      return;
    }

    if ((files?.length ?? 0) === 0 && initialPhotoshootId && (initialUrls?.length ?? 0) > 0) {
      onComplete(initialPhotoshootId, initialUrls);
      return;
    }

    setUploading(true);
    try {
      let photoshootId = initialPhotoshootId;
      if (!photoshootId) {
        const psRes = await fetch('/api/photoshoots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `Фотосессия ${new Date().toLocaleDateString('ru-RU')}` }),
        });
        if (!psRes.ok) throw new Error('Не удалось создать фотосессию');
        const ps = await psRes.json();
        photoshootId = ps?.id;
      }

      if (!photoshootId) {
        throw new Error('Не удалось определить фотосессию');
      }

      const urls: string[] = [];
      for (let i = 0; i < (files?.length ?? 0); i++) {
        const file = files[i];
        if (!file) continue;

        // Получаем presigned URL
        const presignRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: true,
          }),
        });
        if (!presignRes.ok) throw new Error('Не удалось получить ссылку для загрузки');
        const { uploadUrl, cloud_storage_path } = await presignRes.json();

        // Загружаем в локальное storage API
        const headers: Record<string, string> = { 'Content-Type': file.type };
        const urlObj = new URL(uploadUrl, window.location.origin);
        const signedHeaders = urlObj.searchParams.get('X-Amz-SignedHeaders') ?? '';
        if (signedHeaders.includes('content-disposition')) {
          headers['Content-Disposition'] = 'attachment';
        }
        const uploadRes = await fetch(uploadUrl, { method: 'PUT', headers, body: file });
        if (!uploadRes.ok) throw new Error('Не удалось загрузить файл');

        // Сохраняем в БД
        const completeRes = await fetch('/api/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoshootId,
            cloud_storage_path,
            isPublic: true,
            fileOrder: initialUrls.length + i,
          }),
        });
        if (!completeRes.ok) throw new Error('Не удалось сохранить изображение');
        const { url } = await completeRes.json();
        urls.push(url);
      }

      toast.success('Фотографии успешно загружены!');
      onComplete(photoshootId, [...initialUrls, ...urls]);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err?.message ?? 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const fileCountText = (count: number) => {
    if (count === 1) return '1 фото';
    if (count >= 2 && count <= 4) return `${count} фото`;
    return `${count} фото`;
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="max-w-none">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef?.current?.click?.()}
        className={`p-6 text-center cursor-pointer transition-all duration-200 rounded-2xl border ${
          dragActive
            ? 'bg-primary/12 border-primary/60 shadow-[0_0_0_2px_hsl(var(--primary)/0.25)]'
            : 'bg-zinc-900/45 border-zinc-800 hover:bg-zinc-900/70 hover:border-zinc-700'
        }`}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragActive ? 'text-primary' : 'text-zinc-500'}`} />
        <p className="text-base font-medium mb-1 text-zinc-100">Перетащите изображения сюда</p>
        <p className="text-sm text-zinc-500">или нажмите для выбора (1–3 изображения, только фото)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
        />
      </div>

      {(previews?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {(previews ?? []).map((p, i) => (
            <div key={i} className="relative aspect-square overflow-hidden bg-zinc-900/70 group">
              <img src={p} alt={`Превью ${i + 1}`} className="object-cover w-full h-full" />
              {(files?.length ?? 0) > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-start">
        <Button
          onClick={handleUpload}
          disabled={uploading || ((files?.length ?? 0) === 0 && (initialUrls?.length ?? 0) === 0)}
          className="gap-2 min-w-[220px]"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</>
          ) : (
            <><ImageIcon className="w-4 h-4" /> Продолжить с {fileCountText((files?.length ?? 0) || (initialUrls?.length ?? 0))}</>
          )}
        </Button>
      </div>
    </div>
  );
}
