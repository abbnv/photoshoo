'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PreviewCarousel } from '@/components/ui/preview-carousel';
import type { FormatPreset, ImpressionOption, SceneDefinition, UseCaseOption } from '@/lib/admin-config';
import {
  findFormatPreset,
  findImpressionOption,
  findSceneDefinition,
  findUseCaseOption,
  type CreativeBriefAnswers,
} from '@/lib/photoshoot-brief';
import StepUpload from './step-upload';
import StepQuiz from './step-quiz';
import StepGeneration from './step-generation';

interface WizardClientProps {
  defaultGenerationCount: number;
  useCaseOptions: UseCaseOption[];
  impressionOptions: ImpressionOption[];
  sceneDefinitions: SceneDefinition[];
  formatPresets: FormatPreset[];
  initialPhotoshootId?: number | null;
  initialSourceImageUrls?: string[];
  initialQuizAnswers?: CreativeBriefAnswers;
  initialStep?: 1 | 2 | 3;
  initialCanvasStatus?: 'idle' | 'processing' | 'completed' | 'error';
}

export default function WizardClient({
  defaultGenerationCount,
  useCaseOptions,
  impressionOptions,
  sceneDefinitions,
  formatPresets,
  initialPhotoshootId = null,
  initialSourceImageUrls = [],
  initialQuizAnswers = {},
  initialStep = 1,
  initialCanvasStatus = 'idle',
}: WizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [briefStep, setBriefStep] = useState(1);
  const [briefTotalSteps, setBriefTotalSteps] = useState(4);
  const [photoshootId, setPhotoshootId] = useState<number | null>(initialPhotoshootId);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sourceImageUrls, setSourceImageUrls] = useState<string[]>(initialSourceImageUrls);
  const [quizAnswers, setQuizAnswers] = useState<CreativeBriefAnswers>(initialQuizAnswers);
  const [canvasImages, setCanvasImages] = useState<(string | null)[]>(() => Array.from({ length: defaultGenerationCount }, () => null));
  const [canvasProgress, setCanvasProgress] = useState(0);
  const [canvasCompletedCount, setCanvasCompletedCount] = useState(0);
  const [canvasStatus, setCanvasStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>(initialCanvasStatus);
  const hasCanvasOutput = canvasImages.some((image) => Boolean(image)) || canvasStatus === 'processing' || canvasStatus === 'completed';
  const selectedUseCase = findUseCaseOption(useCaseOptions, quizAnswers.useCaseKey);
  const selectedImpression = findImpressionOption(impressionOptions, quizAnswers.impressionKey);
  const selectedFormat = findFormatPreset(formatPresets, quizAnswers.formatPresetKey) ?? formatPresets[0];
  const selectedScene = findSceneDefinition(sceneDefinitions, quizAnswers.sceneId);
  const canvasAspectRatio = selectedFormat?.aspectRatio?.replace(':', ' / ') || '9 / 16';
  const isPortraitFormat = selectedFormat?.aspectRatio !== '16:9';
  const slideInnerClassName = isPortraitFormat ? 'mx-auto w-full max-w-[320px]' : 'mx-auto w-full max-w-[760px]';
  const carouselItemClassName = isPortraitFormat
    ? 'flex-[0_0_58%] sm:flex-[0_0_46%] lg:flex-[0_0_36%]'
    : 'flex-[0_0_90%] sm:flex-[0_0_82%] lg:flex-[0_0_72%]';
  const totalFlowSteps = 1 + briefTotalSteps + 1;
  const currentFlowStep = step === 1 ? 1 : step === 2 ? 1 + briefStep : totalFlowSteps;
  const currentStep = {
    1: { title: 'Загрузка фото', hint: 'Сначала добавим референсы для генерации.' },
    2: { title: '', hint: '' },
    3: { title: 'Генерация', hint: 'Осталось запустить генерацию изображений.' },
  }[step] ?? { title: 'Редактор', hint: 'Продолжаем настройку фотосессии.' };
  const canvasSlides = canvasImages.map((url, index) => (
    <div key={`${url ?? 'slot'}-${index}`} className={slideInnerClassName}>
      <div className="rounded-2xl bg-zinc-900/80 p-3">
        <div className="relative overflow-hidden rounded-[20px] bg-zinc-950" style={{ aspectRatio: canvasAspectRatio }}>
          {url ? (
            <img src={url} alt={`Generated preview ${index + 1}`} className="h-full w-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 via-zinc-900/20 to-black/60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500/90">
                <Camera className="mb-2 h-6 w-6" />
                <span className="px-3 text-center text-[11px]">Здесь появятся ваши фото</span>
              </div>
            </>
          )}
          {canvasStatus === 'processing' && !url && index === Math.min(canvasCompletedCount, canvasImages.length - 1) && (
            <div className="absolute inset-x-4 bottom-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/50">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${canvasProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ));

  const handleUploadComplete = useCallback((id: number, urls: string[]) => {
    setPhotoshootId(id);
    setSourceImageUrls(urls);
    setStep(2);
  }, []);

  const handleQuizComplete = useCallback((answers: CreativeBriefAnswers) => {
    setQuizAnswers(answers);
    setStep(3);
  }, []);

  const handleGenerationComplete = useCallback(() => {
    if (!photoshootId) return;
    router.push(`/photoshoots/${photoshootId}`);
    router.refresh();
  }, [photoshootId, router]);

  const handleGenerationStreamUpdate = useCallback((update: {
    status: 'idle' | 'processing' | 'completed' | 'error';
    progress?: number;
    completedCount?: number;
    totalCount?: number;
    imageUrl?: string;
    imageIndex?: number;
  }) => {
    setCanvasStatus(update.status);
    if (typeof update.progress === 'number') {
      setCanvasProgress(update.progress);
    }
    if (typeof update.completedCount === 'number') {
      setCanvasCompletedCount(update.completedCount);
    }
    if (typeof update.totalCount === 'number') {
      const nextTotalCount = update.totalCount;
      setCanvasImages((prev) => {
        if (prev.length === nextTotalCount) return prev;
        return Array.from({ length: nextTotalCount }, (_, index) => prev[index] ?? null);
      });
    }
    if (update.imageUrl && typeof update.imageIndex === 'number') {
      const nextImageIndex = update.imageIndex;
      const nextImageUrl = update.imageUrl;
      setCanvasImages((prev) => {
        const next = [...prev];
        next[nextImageIndex] = nextImageUrl ?? null;
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (canvasStatus === 'completed' && photoshootId) {
      router.push(`/photoshoots/${photoshootId}`);
      router.refresh();
    }
  }, [canvasStatus, photoshootId, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-[#080808] border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid min-h-screen xl:grid-cols-[30%_70%]">
            <aside className="flex h-screen flex-col bg-[#050505] border-r border-white/10 p-4 md:p-5">
              <button
                onClick={() => router.push('/photoshoots')}
                className="inline-flex items-center gap-2 mb-5 hover:opacity-85 transition-opacity"
              >
                <Camera className="w-5 h-5 text-primary" />
                <span className="text-zinc-100 font-semibold">AI Фотосессия</span>
              </button>
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Шаг {currentFlowStep} из {totalFlowSteps}
                </div>
                {currentStep.title ? <h1 className="mt-4 text-2xl font-semibold text-zinc-100">{currentStep.title}</h1> : null}
                {currentStep.hint ? <p className="mt-2 text-sm text-zinc-500">{currentStep.hint}</p> : null}
                {step === 3 && (
                  <div className="mt-4 space-y-2 rounded-2xl bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    {selectedUseCase ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3 py-2">
                        <span className="text-zinc-500">Съёмка для</span>
                        <span>{selectedUseCase.label}</span>
                      </div>
                    ) : null}
                    {selectedImpression ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3 py-2">
                        <span className="text-zinc-500">Впечатление</span>
                        <span>{selectedImpression.label}</span>
                      </div>
                    ) : null}
                    {selectedFormat ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3 py-2">
                        <span className="text-zinc-500">Формат</span>
                        <span>{selectedFormat.label}</span>
                      </div>
                    ) : null}
                    {selectedScene ? (
                      <div className="rounded-xl bg-zinc-950 px-3 py-2">
                        <div className="text-zinc-500">Сцена</div>
                        <div className="mt-1 font-medium text-zinc-100">{selectedScene.title}</div>
                        <div className="mt-1 text-xs text-zinc-500">{selectedScene.subtitle}</div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex-1 overflow-y-auto"
                >
                  {step === 1 && (
                    <StepUpload
                      files={uploadedFiles}
                      setFiles={setUploadedFiles}
                      initialPhotoshootId={photoshootId}
                      initialUrls={sourceImageUrls}
                      onComplete={handleUploadComplete}
                    />
                  )}
                  {step === 2 && (
                    <StepQuiz
                      photoshootId={photoshootId}
                      answers={quizAnswers}
                      setAnswers={setQuizAnswers}
                      onComplete={handleQuizComplete}
                      onBack={() => setStep(1)}
                      useCaseOptions={useCaseOptions}
                      impressionOptions={impressionOptions}
                      formatPresets={formatPresets}
                      sceneDefinitions={sceneDefinitions}
                      onStepChange={(nextStep, totalSteps) => {
                        setBriefStep(nextStep);
                        setBriefTotalSteps(totalSteps);
                      }}
                    />
                  )}
                  {step === 3 && (
                    <StepGeneration
                      photoshootId={photoshootId}
                      quizAnswers={quizAnswers}
                      totalSlots={canvasImages.length}
                      onStreamUpdate={handleGenerationStreamUpdate}
                      onComplete={handleGenerationComplete}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </aside>

            <main className="bg-[#0b0b0b] p-4 md:p-6">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">Canvas Preview</div>
              <p className="text-xs text-zinc-600 mb-4">
                Здесь будут сгенерированные фото. Всего будет создано {canvasImages.length} изображений.
              </p>
              <div className="min-h-[calc(100vh-6rem)] bg-black/35 rounded-xl flex items-center justify-center px-3 py-6">
                <div className="w-full max-w-[1100px]">
                  <PreviewCarousel slides={canvasSlides} itemClassName={carouselItemClassName} />
                  <div className="mt-5 text-center text-zinc-500">
                    <Camera className="mx-auto mb-2 h-5 w-5" />
                    <p className="text-sm">
                      {hasCanvasOutput && canvasStatus === 'processing'
                        ? `Генерация: ${canvasCompletedCount} из ${canvasImages.length}`
                        : 'Здесь появятся ваши сгенерированные фото'}
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
      </div>
    </div>
  );
}
