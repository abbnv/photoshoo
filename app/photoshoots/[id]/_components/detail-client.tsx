'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Camera, Download, Sparkles, X, ZoomIn, Loader2, BriefcaseBusiness, Image as ImageIcon, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewCarousel } from '@/components/ui/preview-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { FormatPreset, ImpressionOption, SceneDefinition, UseCaseOption, VariationChip } from '@/lib/admin-config';
import {
  findFormatPreset,
  findImpressionOption,
  findSceneDefinition,
  findUseCaseOption,
  getCompatibleVariationChips,
  normalizeCreativeBrief,
} from '@/lib/photoshoot-brief';

interface Photoshoot {
  id: number;
  title: string;
  status: string;
  quizAnswers: Record<string, unknown> | null;
  createdAt: string;
  sourceImages: { id: number; url: string }[];
  generatedImages: { id: number; url: string; prompt?: string; pending?: boolean }[];
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  processing: 'Генерация',
  completed: 'Готово',
  failed: 'Ошибка',
};

export default function DetailClient({
  id,
  useCaseOptions,
  impressionOptions,
  formatPresets,
  sceneDefinitions,
  variationChips,
}: {
  id: string;
  useCaseOptions: UseCaseOption[];
  impressionOptions: ImpressionOption[];
  formatPresets: FormatPreset[];
  sceneDefinitions: SceneDefinition[];
  variationChips: VariationChip[];
}) {
  const router = useRouter();
  const [data, setData] = useState<Photoshoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [fullscreenImageId, setFullscreenImageId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [scrollTargetIndex, setScrollTargetIndex] = useState<number | null>(null);
  const [sourceLightboxUrl, setSourceLightboxUrl] = useState<string | null>(null);
  const [variationLoadingKey, setVariationLoadingKey] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/photoshoots/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить');
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => toast.error('Не удалось загрузить фотосессию'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] rounded-2xl overflow-hidden border border-white/10">
        <div className="grid min-h-screen xl:grid-cols-[30%_70%]">
          <div className="border-r border-white/10 bg-[#050505] p-5">
            <Skeleton className="h-8 w-40 bg-zinc-900" />
            <Skeleton className="mt-8 h-7 w-28 bg-zinc-900" />
            <Skeleton className="mt-3 h-14 w-full bg-zinc-900" />
          </div>
          <div className="bg-[#0b0b0b] p-6">
            <Skeleton className="h-[70vh] w-full rounded-xl bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080808] rounded-2xl overflow-hidden border border-white/10">
        <div className="px-4 py-20 text-center">
          <p className="text-muted-foreground">Фотосессия не найдена.</p>
          <Button className="mt-4" onClick={() => router.push('/photoshoots')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-500/20 text-yellow-500',
    processing: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    failed: 'bg-red-500/20 text-red-500',
  };
  const brief = normalizeCreativeBrief(data?.quizAnswers);
  const selectedUseCase = findUseCaseOption(useCaseOptions, brief.useCaseKey);
  const selectedImpression = findImpressionOption(impressionOptions, brief.impressionKey);
  const selectedFormat = findFormatPreset(formatPresets, brief.formatPresetKey) ?? formatPresets[0];
  const selectedScene = findSceneDefinition(sceneDefinitions, brief.sceneId);
  const sidebarDescription = selectedScene
    ? `Сюжет: ${selectedScene.title}. ${selectedScene.subtitle}`
    : selectedUseCase
      ? `Готовая фотосессия для сценария "${selectedUseCase.label.toLowerCase()}".`
      : 'Готовая фотосессия с выбранными кадрами и быстрыми вариациями.';
  const availableVariationChips = getCompatibleVariationChips(variationChips, brief, sceneDefinitions);
  const canvasAspectRatio = selectedFormat?.aspectRatio?.replace(':', ' / ') || '9 / 16';
  const isPortraitFormat = selectedFormat?.aspectRatio !== '16:9';
  const slideInnerClassName = isPortraitFormat ? 'mx-auto w-full max-w-[320px]' : 'mx-auto w-full max-w-[760px]';
  const carouselItemClassName = isPortraitFormat
    ? 'flex-[0_0_58%] sm:flex-[0_0_46%] lg:flex-[0_0_36%]'
    : 'flex-[0_0_90%] sm:flex-[0_0_82%] lg:flex-[0_0_72%]';
  const fullscreenImage =
    fullscreenImageId == null ? null : (data?.generatedImages ?? []).find((image) => image.id === fullscreenImageId) ?? null;
  const selectedImage =
    selectedImageId == null ? null : (data?.generatedImages ?? []).find((image) => image.id === selectedImageId) ?? null;
  const selectedImageIndex =
    selectedImageId == null ? -1 : Math.max(0, (data?.generatedImages ?? []).findIndex((image) => image.id === selectedImageId));
  const selectedImageNumber = selectedImageIndex >= 0 ? selectedImageIndex + 1 : null;
  const handleCarouselSelect = (index: number) => {
    const currentImage = data?.generatedImages?.[index];
    if (!currentImage) return;

    if (scrollTargetIndex !== null && index === scrollTargetIndex) {
      setScrollTargetIndex(null);
      return;
    }

    if (selectedImageId && currentImage.id !== selectedImageId) {
      setSelectedImageId(null);
    }
  };

  const generatedSlides = (data?.generatedImages ?? []).map((img, i) => (
    <motion.div
      key={img?.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className={`group text-left ${slideInnerClassName}`}
    >
      <button
        type="button"
        onClick={() => {
          setSelectedImageId(img.id);
          setScrollTargetIndex(i);
        }}
        className="w-full rounded-2xl bg-zinc-900/80 p-3 transition-all"
      >
        <div
          className={`relative overflow-hidden rounded-[20px] bg-zinc-950 transition-all ${
            selectedImageId === img.id
              ? 'ring-2 ring-primary/80 ring-offset-2 ring-offset-zinc-900 shadow-[0_0_28px_rgba(251,146,60,0.12)]'
              : 'ring-1 ring-transparent group-hover:ring-white/10'
          }`}
          style={{ aspectRatio: canvasAspectRatio }}
        >
          {img.pending || !img.url ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400">
              <Loader2 className="mb-3 h-7 w-7 animate-spin text-primary" />
              <div className="text-sm">Генерируем вариант...</div>
            </div>
          ) : (
            <>
              <img src={img?.url} alt={`Портрет ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
            </>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            Кадр {i + 1}
          </div>
          {selectedImageId === img.id ? (
            <div className="absolute right-3 top-3 rounded-full bg-primary/14 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-sm">
              Выбран
            </div>
          ) : null}
        </div>
      </button>
    </motion.div>
  ));

  const handleDelete = async () => {
    if (!data || deleting) return;

    const confirmed = window.confirm(`Удалить фотосессию "${data.title ?? 'Без названия'}"? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/photoshoots/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete photoshoot');
      }
      toast.success('Фотосессия удалена');
      router.push('/photoshoots');
      router.refresh();
    } catch {
      toast.error('Не удалось удалить фотосессию');
    } finally {
      setDeleting(false);
    }
  };

  const handleVariation = async (chip: VariationChip) => {
    if (!selectedImage || variationLoadingKey) return;

    const placeholderId = -Date.now();
    const placeholderIndex = data.generatedImages.length;
    setVariationLoadingKey(chip.key);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        generatedImages: [
          ...prev.generatedImages,
          {
            id: placeholderId,
            url: '',
            prompt: selectedImage.prompt,
            pending: true,
          },
        ],
      };
    });
    setSelectedImageId(placeholderId);
    setScrollTargetIndex(placeholderIndex);

    try {
      const response = await fetch(`/api/photoshoots/${id}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatedImageId: selectedImage.id, chipKey: chip.key }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 402) {
          const error: any = new Error(payload?.error ?? 'Недостаточно токенов');
          error.code = 'INSUFFICIENT_TOKENS';
          throw error;
        }
        throw new Error(payload?.error ?? 'Не удалось создать вариацию');
      }

      const nextImage = payload?.image;
      if (!nextImage?.id || !nextImage?.url) {
        throw new Error('Сервер не вернул новую вариацию');
      }

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          generatedImages: prev.generatedImages.map((image) =>
            image.id === placeholderId
              ? { ...nextImage, pending: false }
              : image
          ),
        };
      });
      setSelectedImageId(nextImage.id);
      setScrollTargetIndex(placeholderIndex);
      toast.success(`Создали вариант: ${chip.label.toLowerCase()}`);
    } catch (error: any) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          generatedImages: prev.generatedImages.filter((image) => image.id !== placeholderId),
        };
      });
      setSelectedImageId(null);
      toast.error(error?.message ?? 'Не удалось создать вариацию');
      if (error?.code === 'INSUFFICIENT_TOKENS') {
        router.push('/billing');
      }
    } finally {
      setVariationLoadingKey(null);
    }
  };

  const handleDownload = async () => {
    if (!selectedImage?.url || downloadLoading) return;

    setDownloadLoading(true);
    try {
      const response = await fetch(selectedImage.url);
      if (!response.ok) {
        throw new Error('Не удалось скачать изображение');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photoshoot-${id}-image-${selectedImage.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      toast.error(error?.message ?? 'Не удалось скачать изображение');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] rounded-2xl overflow-hidden border border-white/10">
      <div className="grid min-h-screen xl:grid-cols-[30%_70%]">
        <aside className="border-r border-white/10 bg-[#050505] p-4 md:p-5">
          <button
            onClick={() => router.push('/photoshoots')}
            className="inline-flex items-center gap-2 mb-5 hover:opacity-85 transition-opacity"
          >
            <Camera className="w-5 h-5 text-primary" />
            <span className="text-zinc-100 font-semibold">AI Фотосессия</span>
          </button>

          <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">Фотосессия</div>
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${data?.status === 'completed' ? 'bg-emerald-400' : data?.status === 'processing' ? 'bg-blue-400' : 'bg-zinc-500'}`} />
              {statusLabels[data?.status ?? 'draft'] ?? data?.status ?? 'Черновик'}
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-zinc-100">{data?.title ?? 'Без названия'}</h1>
            <p className="mt-2 text-sm text-zinc-500">{sidebarDescription}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <Calendar className="h-3.5 w-3.5" />
              {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('ru-RU') : ''}
            </div>
          </div>

          {(selectedUseCase || selectedImpression || selectedScene) && (
            <div className="mb-5 rounded-2xl bg-zinc-900/55 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Sparkles className="h-4 w-4 text-primary" />
                Параметры съёмки
              </div>
              <div className="space-y-2">
                {selectedUseCase ? (
                  <div className="flex items-center justify-between rounded-xl bg-zinc-950 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <BriefcaseBusiness className="h-4 w-4 text-primary" />
                      <span>Съёмка для</span>
                    </div>
                    <span className="text-sm text-zinc-500">{selectedUseCase.label}</span>
                  </div>
                ) : null}
                {selectedImpression ? (
                    <div className="flex items-center justify-between rounded-xl bg-zinc-950 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Впечатление</span>
                      </div>
                      <span className="text-sm text-zinc-500">{selectedImpression.label}</span>
                    </div>
                ) : null}
                {selectedFormat ? (
                  <div className="flex items-center justify-between rounded-xl bg-zinc-950 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span>Формат</span>
                    </div>
                    <span className="text-sm text-zinc-500">{selectedFormat.label}</span>
                  </div>
                ) : null}
                {selectedScene ? (
                  <div className="rounded-xl bg-zinc-950 px-3 py-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span>Сюжет съёмки</span>
                    </div>
                    <div className="mt-2 font-medium text-zinc-100">{selectedScene.title}</div>
                    <div className="mt-1 text-sm text-zinc-500">{selectedScene.subtitle}</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {(data?.sourceImages?.length ?? 0) > 0 && (
            <div className="mb-5 rounded-2xl bg-zinc-900/55 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Camera className="h-4 w-4 text-primary" />
                Исходные фото
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(data?.sourceImages ?? []).map((img) => (
                  <button
                    key={img?.id}
                    onClick={() => setSourceLightboxUrl(img?.url)}
                    className="relative overflow-hidden rounded-xl bg-zinc-950"
                  >
                    <img src={img?.url} alt="Исходное фото" className="aspect-square h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button variant="ghost" onClick={() => router.push('/photoshoots')} className="w-full justify-start gap-2">
              <ArrowLeft className="w-4 h-4" /> Назад к фотосессиям
            </Button>
            <Button variant="destructive" className="w-full gap-2" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Удалить фотосессию
            </Button>
          </div>
        </aside>

        <main className="bg-[#0b0b0b] p-4 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">Canvas Preview</div>
          <p className="text-xs text-zinc-600 mb-4">
            {(data?.generatedImages?.length ?? 0) > 0
              ? `Сгенерировано ${(data?.generatedImages?.length ?? 0)} изображений`
              : 'Здесь будут сгенерированные фото'}
          </p>
          <div className="min-h-[calc(100vh-6rem)] bg-black/35 rounded-xl px-3 py-6">
            {(data?.generatedImages?.length ?? 0) > 0 ? (
              <div className="mx-auto w-full max-w-[1100px]">
                <PreviewCarousel
                  slides={generatedSlides}
                  itemClassName={carouselItemClassName}
                  selectedIndex={scrollTargetIndex ?? undefined}
                  onSelectChange={handleCarouselSelect}
                />
                {selectedImage ? (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Редактировать кадр {selectedImageNumber ?? ''}
                    </div>
                    {selectedImage.pending ? (
                      <p className="text-sm text-zinc-500">
                        Для этого слота уже создаётся новый вариант. Как только он будет готов, placeholder заменится на финальный кадр прямо в карусели.
                      </p>
                    ) : (
                      <>
                        <p className="mb-4 text-sm text-zinc-500">
                          Выбран кадр для вариации. Нажмите на одно из действий ниже, и мы создадим новый вариант в том же стиле фотосессии.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setFullscreenImageId(selectedImage.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800"
                          >
                            <ZoomIn className="h-4 w-4" />
                            Открыть
                          </button>
                          <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloadLoading}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Download className="h-4 w-4" />
                            {downloadLoading ? 'Скачиваем...' : 'Скачать'}
                          </button>
                          {availableVariationChips.map((chip) => (
                            <button
                              key={chip.key}
                              type="button"
                              onClick={() => handleVariation(chip)}
                              disabled={Boolean(variationLoadingKey)}
                              className="rounded-full border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {variationLoadingKey === chip.key ? 'Генерируем...' : `${chip.label} · -1 токен`}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#101010] p-4 text-sm text-zinc-500">
                    Нажмите на иконку magic у любого кадра, чтобы открыть быстрые вариации под фото.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                  <p>Эта фотосессия ещё генерируется...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Просмотр */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/85 p-4 md:p-6" onClick={() => setFullscreenImageId(null)}>
          <button className="absolute right-4 top-4 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          <div className="flex h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={fullscreenImage.url}
              alt="Просмотр"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {sourceLightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSourceLightboxUrl(null)}>
          <button className="absolute right-4 top-4 text-white hover:text-gray-300">
            <X className="h-8 w-8" />
          </button>
          <img
            src={sourceLightboxUrl}
            alt="Исходное фото"
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
