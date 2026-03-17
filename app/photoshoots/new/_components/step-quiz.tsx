'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { FormatPreset, ImpressionOption, SceneDefinition, UseCaseOption } from '@/lib/admin-config';
import { getCanvasFormatOptions, getMatchingScenes, getRankedScenes, type CreativeBriefAnswers } from '@/lib/photoshoot-brief';

interface StepQuizProps {
  photoshootId: number | null;
  answers: CreativeBriefAnswers;
  setAnswers: (answers: CreativeBriefAnswers) => void;
  onComplete: (answers: CreativeBriefAnswers) => void;
  onBack: () => void;
  useCaseOptions: UseCaseOption[];
  impressionOptions: ImpressionOption[];
  formatPresets: FormatPreset[];
  sceneDefinitions: SceneDefinition[];
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
}

function SelectionButton({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-left transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-zinc-900/55 text-zinc-100 hover:bg-zinc-900'
      }`}
    >
      <div className="text-sm font-medium">{label}</div>
      {hint ? <div className={`mt-1 text-xs ${active ? 'text-primary-foreground/75' : 'text-zinc-500'}`}>{hint}</div> : null}
    </button>
  );
}

function FormatButton({
  active,
  label,
  aspectRatio,
  orientation,
  onClick,
}: {
  active: boolean;
  label: string;
  aspectRatio: string;
  orientation: 'portrait' | 'landscape';
  onClick: () => void;
}) {
  const Icon = orientation === 'portrait' ? RectangleVertical : RectangleHorizontal;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-4 text-left transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-zinc-900/55 text-zinc-100 hover:bg-zinc-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${active ? 'bg-white/15' : 'bg-zinc-950'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className={`mt-1 text-xs ${active ? 'text-primary-foreground/75' : 'text-zinc-500'}`}>{aspectRatio}</div>
        </div>
      </div>
    </button>
  );
}

export default function StepQuiz({
  photoshootId,
  answers,
  setAnswers,
  onComplete,
  onBack,
  useCaseOptions,
  impressionOptions,
  formatPresets,
  sceneDefinitions,
  onStepChange,
}: StepQuizProps) {
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const formatOptions = useMemo(() => getCanvasFormatOptions(formatPresets).slice(0, 2), [formatPresets]);

  const rankedScenes = useMemo(
    () => getRankedScenes(sceneDefinitions, answers).slice(0, 6),
    [answers, sceneDefinitions]
  );
  const matchedScenes = rankedScenes.map((item) => item.scene);

  const allAnswered = Boolean(answers.useCaseKey && answers.impressionKey && answers.formatPresetKey && answers.sceneId);
  const isNextDisabled =
    saving ||
    (activeStep === 0 && !answers.useCaseKey) ||
    (activeStep === 1 && !answers.impressionKey) ||
    (activeStep === 2 && !answers.formatPresetKey) ||
    (activeStep === 3 && !answers.sceneId);
  const steps = [
    {
      title: 'Для чего вам фотосессия?',
      description: 'Сначала поймём задачу, под которую мы собираем эту съёмку.',
    },
    {
      title: 'Какое впечатление должно получиться?',
      description: 'Это поможет AI держать правильный тон и подачу в кадре.',
    },
    {
      title: 'Какой формат нужен?',
      description: 'Выберите пропорцию будущих кадров. Плейсхолдеры справа сразу подстроятся.',
    },
    {
      title: 'Выберите сюжет съёмки',
      description: 'AI подобрал сцены под ваш запрос. Остаётся выбрать подходящее направление.',
    },
  ] as const;

  useEffect(() => {
    onStepChange?.(activeStep + 1, steps.length);
  }, [activeStep, onStepChange, steps.length]);

  useEffect(() => {
    if (activeStep === 3 && (!answers.useCaseKey || !answers.impressionKey || !answers.formatPresetKey)) {
      if (!answers.useCaseKey) setActiveStep(0);
      else if (!answers.impressionKey) setActiveStep(1);
      else setActiveStep(2);
    }
  }, [activeStep, answers.formatPresetKey, answers.impressionKey, answers.useCaseKey]);

  const handleSelect = (patch: Partial<CreativeBriefAnswers>) => {
    const nextAnswers = { ...answers, ...patch };
    const nextScenes = getMatchingScenes(sceneDefinitions, nextAnswers);

    if (patch.useCaseKey || patch.impressionKey || patch.formatPresetKey) {
      const sceneStillValid = nextScenes.some((scene) => scene.id === nextAnswers.sceneId);
      if (!sceneStillValid) {
        nextAnswers.sceneId = undefined;
      }
    }

    setAnswers(nextAnswers);
  };

  const handleContinue = async () => {
    if (!allAnswered) {
      toast.error('Выберите цель, впечатление и сюжет съёмки');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/photoshoots/${photoshootId}/quiz`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizAnswers: answers }),
      });

      if (!res.ok) {
        throw new Error('Не удалось сохранить creative brief');
      }

      onComplete(answers);
    } catch (err: any) {
      toast.error(err?.message ?? 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 0 && !answers.useCaseKey) {
      toast.error('Выберите, для чего нужна фотосессия');
      return;
    }

    if (activeStep === 1 && !answers.impressionKey) {
      toast.error('Выберите впечатление для этой съёмки');
      return;
    }

    if (activeStep === 2 && !answers.formatPresetKey) {
      toast.error('Выберите формат кадра');
      return;
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    handleContinue();
  };

  const handleBackStep = () => {
    if (activeStep === 0) {
      onBack();
      return;
    }

    setActiveStep((prev) => prev - 1);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl bg-zinc-900/45 p-4">
        <div className="mb-4">
          <div className="text-lg font-medium text-zinc-100">{steps[activeStep].title}</div>
          <p className="mt-1 text-sm text-zinc-500">{steps[activeStep].description}</p>
        </div>

        {activeStep === 0 ? (
          <div className="grid gap-2">
            {useCaseOptions.map((option) => (
              <SelectionButton
                key={option.key}
                active={answers.useCaseKey === option.key}
                label={option.label}
                hint={option.hint}
                onClick={() => handleSelect({ useCaseKey: option.key })}
              />
            ))}
          </div>
        ) : null}

        {activeStep === 1 ? (
          <div className="grid grid-cols-2 gap-2">
            {impressionOptions.map((option) => (
              <SelectionButton
                key={option.key}
                active={answers.impressionKey === option.key}
                label={option.label}
                onClick={() => handleSelect({ impressionKey: option.key })}
              />
            ))}
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((format) => (
              <FormatButton
                key={format.key}
                active={answers.formatPresetKey === format.key}
                label={format.label}
                aspectRatio={format.aspectRatio}
                orientation={format.aspectRatio === '16:9' ? 'landscape' : 'portrait'}
                onClick={() => handleSelect({ formatPresetKey: format.key })}
              />
            ))}
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-zinc-200">AI подобрал сюжеты для этой съёмки</div>

            {matchedScenes.length > 0 ? (
              <div className="space-y-2">
                {rankedScenes.map(({ scene, reasons }, index) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => handleSelect({ sceneId: scene.id })}
                    className={`w-full rounded-2xl px-4 py-4 text-left transition-colors ${
                      answers.sceneId === scene.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-zinc-950 text-zinc-100 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{scene.title}</div>
                          {index < 3 ? (
                            <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                              answers.sceneId === scene.id ? 'bg-white/15 text-primary-foreground/85' : 'bg-primary/10 text-primary'
                            }`}>
                              #{index + 1}
                            </span>
                          ) : null}
                        </div>
                        <div className={`mt-1 text-xs ${answers.sceneId === scene.id ? 'text-primary-foreground/75' : 'text-zinc-500'}`}>
                          {scene.subtitle}
                        </div>
                      </div>
                      <div className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${answers.sceneId === scene.id ? 'bg-white/15' : 'bg-zinc-900 text-zinc-500'}`}>
                        {scene.locationFamily}
                      </div>
                    </div>
                    <div className={`mt-3 grid grid-cols-2 gap-2 text-[11px] ${answers.sceneId === scene.id ? 'text-primary-foreground/85' : 'text-zinc-400'}`}>
                      <div className="rounded-xl bg-black/20 px-2 py-2">Свет: {scene.lightingFamily}</div>
                      <div className="rounded-xl bg-black/20 px-2 py-2">Одежда: {scene.wardrobeFamily}</div>
                    </div>
                    {reasons.length > 0 ? (
                      <div className={`mt-3 flex flex-wrap gap-2 text-[11px] ${answers.sceneId === scene.id ? 'text-primary-foreground/85' : 'text-zinc-500'}`}>
                        {reasons.map((reason) => (
                          <span
                            key={reason}
                            className={`rounded-full px-2.5 py-1 ${
                              answers.sceneId === scene.id ? 'bg-black/20' : 'bg-zinc-900'
                            }`}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-950 px-4 py-5 text-sm text-zinc-500">
                Сначала выберите цель и впечатление, чтобы AI подобрал релевантные сцены.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-auto bg-[#050505] pb-1 pt-4">
        <div className="flex justify-between gap-3 border-t border-white/5 pt-4">
        <Button variant="ghost" onClick={handleBackStep} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <Button onClick={handleNextStep} disabled={isNextDisabled} className="gap-2">
          {activeStep === steps.length - 1 ? (saving ? 'Сохранение...' : 'Сгенерировать фотосессию') : 'Дальше'} <ArrowRight className="h-4 w-4" />
        </Button>
        </div>
      </div>
    </div>
  );
}
