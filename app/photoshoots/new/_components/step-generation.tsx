'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { CreativeBriefAnswers } from '@/lib/photoshoot-brief';

interface StepGenerationProps {
  photoshootId: number | null;
  quizAnswers: CreativeBriefAnswers;
  totalSlots: number;
  onStreamUpdate: (update: {
    status: 'idle' | 'processing' | 'completed' | 'error';
    progress?: number;
    completedCount?: number;
    totalCount?: number;
    imageUrl?: string;
    imageIndex?: number;
  }) => void;
  onComplete: (images: string[]) => void;
}

export default function StepGeneration({ photoshootId, quizAnswers, totalSlots, onStreamUpdate, onComplete }: StepGenerationProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'starting' | 'processing' | 'completed' | 'error'>('starting');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Запуск генерации...');
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  const startGeneration = async () => {
    setStatus('starting');
    setProgress(0);
    setError('');
    setMessage('Запуск генерации...');
    onStreamUpdate({ status: 'processing', progress: 0, completedCount: 0, totalCount: totalSlots });

    try {
      const response = await fetch('/api/photoshoots/' + photoshootId + '/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizAnswers }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 402) {
          toast.error(errData?.error ?? 'Недостаточно токенов');
          router.push('/billing');
          return;
        }
        throw new Error(errData?.error ?? 'Ошибка генерации');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Нет потока ответа');

      const decoder = new TextDecoder();
      let partialRead = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split('\n');
        partialRead = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              if (parsed?.status === 'processing') {
                setStatus('processing');
                setProgress(parsed?.progress ?? 0);
                setMessage(parsed?.message ?? 'Генерация...');
                onStreamUpdate({
                  status: 'processing',
                  progress: parsed?.progress ?? 0,
                  completedCount: parsed?.completedCount ?? 0,
                  totalCount: parsed?.totalCount ?? totalSlots,
                });
              } else if (parsed?.status === 'image_generated') {
                onStreamUpdate({
                  status: 'processing',
                  progress: parsed?.progress ?? progress,
                  completedCount: parsed?.completedCount ?? 0,
                  totalCount: parsed?.totalCount ?? totalSlots,
                  imageUrl: parsed?.imageUrl ?? '',
                  imageIndex: parsed?.imageIndex ?? 0,
                });
              } else if (parsed?.status === 'completed') {
                setStatus('completed');
                setProgress(100);
                setMessage('Генерация завершена!');
                const images = parsed?.images ?? [];
                onStreamUpdate({
                  status: 'completed',
                  progress: 100,
                  completedCount: parsed?.completedCount ?? images.length,
                  totalCount: parsed?.totalCount ?? totalSlots,
                });
                onComplete(images);
                return;
              } else if (parsed?.status === 'error') {
                throw new Error(parsed?.message ?? 'Ошибка генерации');
              }
            } catch (e: any) {
              if (e?.message && e.message !== 'Ошибка генерации') {
                // Skip JSON parse errors on partial data
              } else if (e?.message) {
                throw e;
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setStatus('error');
      setError(err?.message ?? 'Ошибка генерации');
      onStreamUpdate({ status: 'error' });
      toast.error(err?.message ?? 'Ошибка генерации');
    }
  };

  useEffect(() => {
    if (!startedRef.current && photoshootId) {
      startedRef.current = true;
      startGeneration();
    }
  }, [photoshootId]);

  return (
    <div className="max-w-none text-center">
      <h2 className="text-2xl font-bold mb-2">Генерация фотосессии</h2>
      <p className="text-muted-foreground mb-10">Подождите немного, пока AI Photographer соберёт ваш первый набор кадров.</p>
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-200">
        За запуск списывается: <span className="font-semibold text-amber-400">-1 токен</span>
      </div>

      {status === 'error' ? (
        <div className="bg-destructive/10 rounded-lg p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-4">{error || 'Что-то пошло не так'}</p>
          <Button onClick={() => { startedRef.current = false; startGeneration(); }} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Повторить (-1 токен)
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <Loader2 className="w-24 h-24 text-primary animate-spin" />
          </div>
          <p className="text-lg font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}
