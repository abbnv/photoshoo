'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  BillingConfig,
  BillingTariffConfig,
  FormatPreset,
  ImpressionOption,
  PortraitPromptConfig,
  RuntimeSettingsConfig,
  SceneDefinition,
  UseCaseOption,
  VariationChip,
} from '@/lib/admin-config';

type EditableUseCase = UseCaseOption;
type EditableImpression = ImpressionOption;
type EditableScene = SceneDefinition;
type EditableChip = VariationChip;
type EditableFormat = FormatPreset;
type EditablePromptConfig = PortraitPromptConfig;
type EditableBillingConfig = BillingConfig;
type EditableTariff = BillingTariffConfig;

interface AdminFormState {
  falApiKey: string;
  openaiApiKey: string;
  lavaApiKey: string;
  lavaWebhookApiKey: string;
  lavaWebhookBasicLogin: string;
  lavaWebhookBasicPassword: string;
  runtimeSettings: RuntimeSettingsConfig;
  useCaseOptions: EditableUseCase[];
  impressionOptions: EditableImpression[];
  sceneDefinitions: EditableScene[];
  variationChips: EditableChip[];
  formatPresets: EditableFormat[];
  portraitPromptConfig: EditablePromptConfig;
  billingConfig: EditableBillingConfig;
}

function parseArrayInput(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToInput(value: string[]): string {
  return value.join(', ');
}

function Textarea({
  value,
  onChange,
  minHeight = 120,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className="w-full rounded-xl border border-input/90 bg-background/80 px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ minHeight }}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <div>
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
      </div>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        checked ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-900 text-zinc-500'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${checked ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
      {label}
    </button>
  );
}

function SectionShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function createEmptyUseCase(): EditableUseCase {
  return { key: '', label: '', enabled: true, hint: '' };
}

function createEmptyImpression(): EditableImpression {
  return { key: '', label: '', enabled: true, toneInstruction: '' };
}

function createEmptyScene(): EditableScene {
  return {
    id: '',
    title: '',
    subtitle: '',
    enabled: true,
    supportedUseCases: [],
    supportedImpressions: [],
    scenePromptTemplate: '',
    portraitPromptTemplate: '',
    locationFamily: '',
    lightingFamily: '',
    wardrobeFamily: '',
    compositionHint: '',
    formatPresetKey: '',
    rankingWeight: 50,
  };
}

function createEmptyChip(): EditableChip {
  return {
    key: '',
    label: '',
    enabled: true,
    instruction: '',
    compatibleSceneFamilies: [],
    compatibleUseCases: [],
    displayOrder: 1,
  };
}

function createEmptyFormat(): EditableFormat {
  return {
    key: '',
    label: '',
    aspectRatio: '9:16',
    outputFormat: 'png',
    resolutionPreset: 'portrait_hd',
    enabled: true,
  };
}

function createEmptyTariff(): EditableTariff {
  return {
    key: '',
    label: '',
    description: '',
    priceLabel: '',
    offerId: '',
    currency: 'RUB',
    tokens: 10,
    enabled: true,
    displayOrder: 1,
  };
}

function normalizePromptConfig(value: unknown): EditablePromptConfig {
  const config = (value ?? {}) as Partial<EditablePromptConfig>;
  return {
    basePromptTemplate: String(config.basePromptTemplate ?? ''),
    editPromptTemplates: Array.isArray(config.editPromptTemplates)
      ? config.editPromptTemplates.map((item) => String(item ?? ''))
      : [],
    qualityPromptTemplate: String(config.qualityPromptTemplate ?? ''),
  };
}

function normalizeRuntimeSettings(value: unknown): RuntimeSettingsConfig {
  const runtime = (value ?? {}) as Partial<RuntimeSettingsConfig>;
  return {
    defaultGenerationsPerPhotoshoot: Number(runtime.defaultGenerationsPerPhotoshoot ?? 12),
    defaultAspectRatio: String(runtime.defaultAspectRatio ?? '9:16'),
    defaultOutputFormat: String(runtime.defaultOutputFormat ?? 'png'),
    defaultResolutionPreset: String(runtime.defaultResolutionPreset ?? 'portrait_hd'),
  };
}

export default function AdminConfigClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdminFormState>({
    falApiKey: '',
    openaiApiKey: '',
    lavaApiKey: '',
    lavaWebhookApiKey: '',
    lavaWebhookBasicLogin: '',
    lavaWebhookBasicPassword: '',
    runtimeSettings: normalizeRuntimeSettings(null),
    useCaseOptions: [],
    impressionOptions: [],
    sceneDefinitions: [],
    variationChips: [],
    formatPresets: [],
    portraitPromptConfig: normalizePromptConfig(null),
    billingConfig: {
      trialGenerations: 10,
      tokenCostPerGeneration: 1,
      tariffs: [],
    },
  });

  useEffect(() => {
    fetch('/api/admin/config')
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load config');
        return response.json();
      })
      .then((data) => {
        setForm({
          falApiKey: data?.falApiKey ?? '',
          openaiApiKey: data?.openaiApiKey ?? '',
          lavaApiKey: data?.lavaApiKey ?? '',
          lavaWebhookApiKey: data?.lavaWebhookApiKey ?? '',
          lavaWebhookBasicLogin: data?.lavaWebhookBasicLogin ?? '',
          lavaWebhookBasicPassword: data?.lavaWebhookBasicPassword ?? '',
          runtimeSettings: normalizeRuntimeSettings(data?.runtimeSettings),
          useCaseOptions: Array.isArray(data?.useCaseOptions) ? data.useCaseOptions : [],
          impressionOptions: Array.isArray(data?.impressionOptions) ? data.impressionOptions : [],
          sceneDefinitions: Array.isArray(data?.sceneDefinitions) ? data.sceneDefinitions : [],
          variationChips: Array.isArray(data?.variationChips) ? data.variationChips : [],
          formatPresets: Array.isArray(data?.formatPresets) ? data.formatPresets : [],
          portraitPromptConfig: normalizePromptConfig(data?.portraitPromptConfig),
          billingConfig: {
            trialGenerations: Number(data?.billingConfig?.trialGenerations ?? 10),
            tokenCostPerGeneration: Number(data?.billingConfig?.tokenCostPerGeneration ?? 1),
            tariffs: Array.isArray(data?.billingConfig?.tariffs) ? data.billingConfig.tariffs : [],
          },
        });
      })
      .catch(() => toast.error('Не удалось загрузить админ-настройки'))
      .finally(() => setLoading(false));
  }, []);

  const updateUseCase = (index: number, patch: Partial<EditableUseCase>) => {
    setForm((prev) => ({
      ...prev,
      useCaseOptions: prev.useCaseOptions.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateImpression = (index: number, patch: Partial<EditableImpression>) => {
    setForm((prev) => ({
      ...prev,
      impressionOptions: prev.impressionOptions.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateScene = (index: number, patch: Partial<EditableScene>) => {
    setForm((prev) => ({
      ...prev,
      sceneDefinitions: prev.sceneDefinitions.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateChip = (index: number, patch: Partial<EditableChip>) => {
    setForm((prev) => ({
      ...prev,
      variationChips: prev.variationChips.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateFormat = (index: number, patch: Partial<EditableFormat>) => {
    setForm((prev) => ({
      ...prev,
      formatPresets: prev.formatPresets.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateTariff = (index: number, patch: Partial<EditableTariff>) => {
    setForm((prev) => ({
      ...prev,
      billingConfig: {
        ...prev.billingConfig,
        tariffs: prev.billingConfig.tariffs.map((item, currentIndex) =>
          currentIndex === index ? { ...item, ...patch } : item
        ),
      },
    }));
  };

  const updateEditPromptTemplate = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      portraitPromptConfig: {
        ...prev.portraitPromptConfig,
        editPromptTemplates: prev.portraitPromptConfig.editPromptTemplates.map((item, currentIndex) =>
          currentIndex === index ? value : item
        ),
      },
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falApiKey: form.falApiKey,
          openaiApiKey: form.openaiApiKey,
          runtimeSettings: form.runtimeSettings,
          useCaseOptions: form.useCaseOptions,
          impressionOptions: form.impressionOptions,
          sceneDefinitions: form.sceneDefinitions,
          variationChips: form.variationChips,
          formatPresets: form.formatPresets,
          portraitPromptConfig: form.portraitPromptConfig,
          lavaApiKey: form.lavaApiKey,
          lavaWebhookApiKey: form.lavaWebhookApiKey,
          lavaWebhookBasicLogin: form.lavaWebhookBasicLogin,
          lavaWebhookBasicPassword: form.lavaWebhookBasicPassword,
          billingConfig: form.billingConfig,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to save');
      }

      toast.success('Настройки сохранены');
    } catch (error: any) {
      toast.error(error?.message || 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1220px] px-4 py-10">
        <div className="flex items-center gap-3 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загрузка настроек...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-100">Админка</h1>
      <p className="mt-2 max-w-3xl text-zinc-400">
        Настройки AI Photographer в более понятном формате: ключи, сцены, промпты, форматы и variation chips без ручного JSON.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <SectionShell
          title="Ключи и runtime"
          description="Базовые ключи и глобальные настройки генерации для всего продукта."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="FAL API key">
              <Input
                value={form.falApiKey}
                onChange={(event) => setForm((prev) => ({ ...prev, falApiKey: event.target.value }))}
                placeholder="fal_key_..."
              />
            </Field>
            <Field label="OpenRouter / OpenAI API key">
              <Input
                value={form.openaiApiKey}
                onChange={(event) => setForm((prev) => ({ ...prev, openaiApiKey: event.target.value }))}
                placeholder="sk-or-v1-..."
              />
            </Field>
            <Field label="Lava API key" hint="Используется для создания invoice через lava.top">
              <Input
                value={form.lavaApiKey}
                onChange={(event) => setForm((prev) => ({ ...prev, lavaApiKey: event.target.value }))}
                placeholder="lava_live_..."
              />
            </Field>
            <Field label="Lava Webhook API key" hint="Проверка входящих вебхуков в X-Api-Key">
              <Input
                value={form.lavaWebhookApiKey}
                onChange={(event) => setForm((prev) => ({ ...prev, lavaWebhookApiKey: event.target.value }))}
                placeholder="whsec_..."
              />
            </Field>
            <Field label="Lava Webhook Basic login" hint="Если заполнен вместе с паролем, webhook начнет валидировать Basic Auth">
              <Input
                value={form.lavaWebhookBasicLogin}
                onChange={(event) => setForm((prev) => ({ ...prev, lavaWebhookBasicLogin: event.target.value }))}
                placeholder="lava_webhook"
              />
            </Field>
            <Field label="Lava Webhook Basic password" hint="Пароль для Authorization: Basic ...">
              <Input
                type="password"
                value={form.lavaWebhookBasicPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, lavaWebhookBasicPassword: event.target.value }))}
                placeholder="super-secret-password"
              />
            </Field>
            <Field label="Генераций на фотосессию">
              <Input
                type="number"
                min={1}
                max={100}
                value={String(form.runtimeSettings.defaultGenerationsPerPhotoshoot)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    runtimeSettings: {
                      ...prev.runtimeSettings,
                      defaultGenerationsPerPhotoshoot: Number(event.target.value || 1),
                    },
                  }))
                }
              />
            </Field>
            <Field label="Aspect ratio">
              <Input
                value={form.runtimeSettings.defaultAspectRatio}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    runtimeSettings: { ...prev.runtimeSettings, defaultAspectRatio: event.target.value },
                  }))
                }
                placeholder="9:16"
              />
            </Field>
            <Field label="Output format">
              <Input
                value={form.runtimeSettings.defaultOutputFormat}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    runtimeSettings: { ...prev.runtimeSettings, defaultOutputFormat: event.target.value },
                  }))
                }
                placeholder="png"
              />
            </Field>
            <Field label="Resolution preset">
              <Input
                value={form.runtimeSettings.defaultResolutionPreset}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    runtimeSettings: { ...prev.runtimeSettings, defaultResolutionPreset: event.target.value },
                  }))
                }
                placeholder="portrait_hd"
              />
            </Field>
          </div>
        </SectionShell>

        <SectionShell
          title="Монетизация (токены)"
          description="Триал, стоимость генерации в токенах и тарифы для покупки через Lava."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  billingConfig: {
                    ...prev.billingConfig,
                    tariffs: [...prev.billingConfig.tariffs, { ...createEmptyTariff(), displayOrder: prev.billingConfig.tariffs.length + 1 }],
                  },
                }))
              }
            >
              <Plus className="h-4 w-4" /> Добавить тариф
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Триал токенов (для новых пользователей)">
              <Input
                type="number"
                min={0}
                value={String(form.billingConfig.trialGenerations)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingConfig: {
                      ...prev.billingConfig,
                      trialGenerations: Number(event.target.value || 0),
                    },
                  }))
                }
              />
            </Field>
            <Field label="Списывать за 1 генерацию">
              <Input
                type="number"
                min={1}
                value={String(form.billingConfig.tokenCostPerGeneration)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingConfig: {
                      ...prev.billingConfig,
                      tokenCostPerGeneration: Number(event.target.value || 1),
                    },
                  }))
                }
              />
            </Field>
          </div>

          <div className="space-y-3">
            {form.billingConfig.tariffs.map((tariff, index) => (
              <div key={`tariff-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1fr_1fr_1.2fr_0.8fr_0.8fr_auto_auto]">
                <Field label="Ключ"><Input value={tariff.key} onChange={(e) => updateTariff(index, { key: e.target.value })} placeholder="pro_60" /></Field>
                <Field label="Название"><Input value={tariff.label} onChange={(e) => updateTariff(index, { label: e.target.value })} placeholder="Pro" /></Field>
                <Field label="Описание"><Input value={tariff.description} onChange={(e) => updateTariff(index, { description: e.target.value })} placeholder="60 токенов" /></Field>
                <Field label="Цена"><Input value={tariff.priceLabel} onChange={(e) => updateTariff(index, { priceLabel: e.target.value })} placeholder="1890 рублей" /></Field>
                <Field label="Lava offerId"><Input value={tariff.offerId} onChange={(e) => updateTariff(index, { offerId: e.target.value })} placeholder="836b9fc5-..." /></Field>
                <Field label="Валюта"><Input value={tariff.currency} onChange={(e) => updateTariff(index, { currency: (e.target.value as 'RUB' | 'USD' | 'EUR') || 'USD' })} placeholder="USD" /></Field>
                <Field label="Токены"><Input type="number" min={1} value={String(tariff.tokens)} onChange={(e) => updateTariff(index, { tokens: Number(e.target.value || 1) })} /></Field>
                <div className="flex items-end"><Toggle checked={tariff.enabled} onChange={(enabled) => updateTariff(index, { enabled })} label={tariff.enabled ? 'Вкл' : 'Выкл'} /></div>
                <div className="flex items-end justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => setForm((prev) => ({ ...prev, billingConfig: { ...prev.billingConfig, tariffs: prev.billingConfig.tariffs.filter((_, currentIndex) => currentIndex !== index) } }))}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Use cases"
          description="Что пользователь выбирает на первом шаге: Instagram, Аватарка, Резюме и так далее."
          action={
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setForm((prev) => ({ ...prev, useCaseOptions: [...prev.useCaseOptions, createEmptyUseCase()] }))}>
              <Plus className="h-4 w-4" /> Добавить
            </Button>
          }
        >
          <div className="space-y-3">
            {form.useCaseOptions.map((item, index) => (
              <div key={`use-case-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1.2fr_auto_auto]">
                <Field label="Ключ"><Input value={item.key} onChange={(e) => updateUseCase(index, { key: e.target.value })} placeholder="instagram" /></Field>
                <Field label="Название"><Input value={item.label} onChange={(e) => updateUseCase(index, { label: e.target.value })} placeholder="Instagram" /></Field>
                <Field label="Подсказка"><Input value={item.hint} onChange={(e) => updateUseCase(index, { hint: e.target.value })} placeholder="Личный бренд и профиль" /></Field>
                <div className="flex items-end"><Toggle checked={item.enabled} onChange={(enabled) => updateUseCase(index, { enabled })} label={item.enabled ? 'Вкл' : 'Выкл'} /></div>
                <div className="flex items-end justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => setForm((prev) => ({ ...prev, useCaseOptions: prev.useCaseOptions.filter((_, currentIndex) => currentIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Impressions"
          description="Какие впечатления пользователь может выбрать на втором шаге."
          action={
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setForm((prev) => ({ ...prev, impressionOptions: [...prev.impressionOptions, createEmptyImpression()] }))}>
              <Plus className="h-4 w-4" /> Добавить
            </Button>
          }
        >
          <div className="space-y-3">
            {form.impressionOptions.map((item, index) => (
              <div key={`impression-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1.5fr_auto_auto]">
                <Field label="Ключ"><Input value={item.key} onChange={(e) => updateImpression(index, { key: e.target.value })} placeholder="professional" /></Field>
                <Field label="Название"><Input value={item.label} onChange={(e) => updateImpression(index, { label: e.target.value })} placeholder="Профессионально" /></Field>
                <Field label="Tone instruction"><Input value={item.toneInstruction} onChange={(e) => updateImpression(index, { toneInstruction: e.target.value })} placeholder="Look polished and trustworthy" /></Field>
                <div className="flex items-end"><Toggle checked={item.enabled} onChange={(enabled) => updateImpression(index, { enabled })} label={item.enabled ? 'Вкл' : 'Выкл'} /></div>
                <div className="flex items-end justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => setForm((prev) => ({ ...prev, impressionOptions: prev.impressionOptions.filter((_, currentIndex) => currentIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Сцены"
          description="Конструктор сюжетов. Здесь можно отдельно заполнять названия, совместимость, scene prompt и portrait prompt без JSON."
          action={
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setForm((prev) => ({ ...prev, sceneDefinitions: [...prev.sceneDefinitions, createEmptyScene()] }))}>
              <Plus className="h-4 w-4" /> Добавить сцену
            </Button>
          }
        >
          <div className="space-y-4">
            {form.sceneDefinitions.map((scene, index) => (
              <div key={`scene-${index}`} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-zinc-100">Сцена {index + 1}</div>
                    <div className="mt-1 text-xs text-zinc-500">Короткий сюжет, который AI может предложить пользователю.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle checked={scene.enabled} onChange={(enabled) => updateScene(index, { enabled })} label={scene.enabled ? 'Вкл' : 'Выкл'} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setForm((prev) => ({ ...prev, sceneDefinitions: prev.sceneDefinitions.filter((_, currentIndex) => currentIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="ID"><Input value={scene.id} onChange={(e) => updateScene(index, { id: e.target.value })} placeholder="minimal-office" /></Field>
                  <Field label="Название"><Input value={scene.title} onChange={(e) => updateScene(index, { title: e.target.value })} placeholder="Светлый офис" /></Field>
                  <Field label="Подзаголовок"><Input value={scene.subtitle} onChange={(e) => updateScene(index, { subtitle: e.target.value })} placeholder="Чистый деловой интерьер" /></Field>
                  <Field label="Локация"><Input value={scene.locationFamily} onChange={(e) => updateScene(index, { locationFamily: e.target.value })} placeholder="office" /></Field>
                  <Field label="Свет"><Input value={scene.lightingFamily} onChange={(e) => updateScene(index, { lightingFamily: e.target.value })} placeholder="soft_daylight" /></Field>
                  <Field label="Одежда"><Input value={scene.wardrobeFamily} onChange={(e) => updateScene(index, { wardrobeFamily: e.target.value })} placeholder="business" /></Field>
                  <Field label="Формат"><Input value={scene.formatPresetKey} onChange={(e) => updateScene(index, { formatPresetKey: e.target.value })} placeholder="portrait_9x16" /></Field>
                  <Field label="Приоритет ранжирования"><Input type="number" value={String(scene.rankingWeight)} onChange={(e) => updateScene(index, { rankingWeight: Number(e.target.value || 0) })} /></Field>
                  <Field label="Композиция"><Input value={scene.compositionHint} onChange={(e) => updateScene(index, { compositionHint: e.target.value })} placeholder="waist up portrait" /></Field>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Use cases" hint="Через запятую">
                    <Input value={arrayToInput(scene.supportedUseCases)} onChange={(e) => updateScene(index, { supportedUseCases: parseArrayInput(e.target.value) })} placeholder="instagram, website" />
                  </Field>
                  <Field label="Impressions" hint="Через запятую">
                    <Input value={arrayToInput(scene.supportedImpressions)} onChange={(e) => updateScene(index, { supportedImpressions: parseArrayInput(e.target.value) })} placeholder="professional, friendly" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Scene prompt" hint="Описывает саму сцену и окружение">
                    <Textarea value={scene.scenePromptTemplate} onChange={(value) => updateScene(index, { scenePromptTemplate: value })} minHeight={150} />
                  </Field>
                  <Field label="Portrait prompt" hint="Описывает сам портрет внутри выбранной сцены">
                    <Textarea value={scene.portraitPromptTemplate} onChange={(value) => updateScene(index, { portraitPromptTemplate: value })} minHeight={150} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Variation chips"
          description="One-click вариации для готового кадра. Тоже редактируются без JSON."
          action={
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setForm((prev) => ({ ...prev, variationChips: [...prev.variationChips, createEmptyChip()] }))}>
              <Plus className="h-4 w-4" /> Добавить чип
            </Button>
          }
        >
          <div className="space-y-3">
            {form.variationChips.map((chip, index) => (
              <div key={`chip-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-zinc-100">Чип {index + 1}</div>
                  <div className="flex items-center gap-2">
                    <Toggle checked={chip.enabled} onChange={(enabled) => updateChip(index, { enabled })} label={chip.enabled ? 'Вкл' : 'Выкл'} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setForm((prev) => ({ ...prev, variationChips: prev.variationChips.filter((_, currentIndex) => currentIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Ключ"><Input value={chip.key} onChange={(e) => updateChip(index, { key: e.target.value })} placeholder="another_scene" /></Field>
                  <Field label="Название"><Input value={chip.label} onChange={(e) => updateChip(index, { label: e.target.value })} placeholder="Другая сцена" /></Field>
                  <Field label="Порядок"><Input type="number" value={String(chip.displayOrder)} onChange={(e) => updateChip(index, { displayOrder: Number(e.target.value || 1) })} /></Field>
                  <Field label="Use cases" hint="Через запятую"><Input value={arrayToInput(chip.compatibleUseCases)} onChange={(e) => updateChip(index, { compatibleUseCases: parseArrayInput(e.target.value) })} placeholder="instagram, website" /></Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Scene families" hint="Через запятую"><Input value={arrayToInput(chip.compatibleSceneFamilies)} onChange={(e) => updateChip(index, { compatibleSceneFamilies: parseArrayInput(e.target.value) })} placeholder="office, studio" /></Field>
                  <Field label="Instruction"><Textarea value={chip.instruction} onChange={(value) => updateChip(index, { instruction: value })} minHeight={110} /></Field>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Format presets"
          description="Какие форматы доступны сценам и генерации."
          action={
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setForm((prev) => ({ ...prev, formatPresets: [...prev.formatPresets, createEmptyFormat()] }))}>
              <Plus className="h-4 w-4" /> Добавить формат
            </Button>
          }
        >
          <div className="space-y-3">
            {form.formatPresets.map((preset, index) => (
              <div key={`format-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto_auto]">
                <Field label="Ключ"><Input value={preset.key} onChange={(e) => updateFormat(index, { key: e.target.value })} placeholder="portrait_9x16" /></Field>
                <Field label="Название"><Input value={preset.label} onChange={(e) => updateFormat(index, { label: e.target.value })} placeholder="Портрет 9:16" /></Field>
                <Field label="Aspect ratio"><Input value={preset.aspectRatio} onChange={(e) => updateFormat(index, { aspectRatio: e.target.value })} placeholder="9:16" /></Field>
                <Field label="Output format"><Input value={preset.outputFormat} onChange={(e) => updateFormat(index, { outputFormat: e.target.value })} placeholder="png" /></Field>
                <Field label="Resolution preset"><Input value={preset.resolutionPreset} onChange={(e) => updateFormat(index, { resolutionPreset: e.target.value })} placeholder="portrait_hd" /></Field>
                <div className="flex items-end"><Toggle checked={preset.enabled} onChange={(enabled) => updateFormat(index, { enabled })} label={preset.enabled ? 'Вкл' : 'Выкл'} /></div>
                <div className="flex items-end justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => setForm((prev) => ({ ...prev, formatPresets: prev.formatPresets.filter((_, currentIndex) => currentIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Portrait prompts"
          description="Отдельные поля для базового prompt, quality layer и edit templates."
        >
          <div className="space-y-4">
            <Field label="Base prompt">
              <Textarea value={form.portraitPromptConfig.basePromptTemplate} onChange={(value) => setForm((prev) => ({ ...prev, portraitPromptConfig: { ...prev.portraitPromptConfig, basePromptTemplate: value } }))} minHeight={140} />
            </Field>
            <Field label="Quality prompt">
              <Textarea value={form.portraitPromptConfig.qualityPromptTemplate} onChange={(value) => setForm((prev) => ({ ...prev, portraitPromptConfig: { ...prev.portraitPromptConfig, qualityPromptTemplate: value } }))} minHeight={120} />
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-zinc-200">Edit prompt templates</div>
                  <div className="mt-1 text-xs text-zinc-500">Каждый шаблон редактируется отдельно, без JSON-массива.</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      portraitPromptConfig: {
                        ...prev.portraitPromptConfig,
                        editPromptTemplates: [...prev.portraitPromptConfig.editPromptTemplates, ''],
                      },
                    }))
                  }
                >
                  <Plus className="h-4 w-4" /> Добавить шаблон
                </Button>
              </div>
              {form.portraitPromptConfig.editPromptTemplates.map((template, index) => (
                <div key={`edit-template-${index}`} className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-zinc-100">Шаблон {index + 1}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          portraitPromptConfig: {
                            ...prev.portraitPromptConfig,
                            editPromptTemplates: prev.portraitPromptConfig.editPromptTemplates.filter((_, currentIndex) => currentIndex !== index),
                          },
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea value={template} onChange={(value) => updateEditPromptTemplate(index, value)} minHeight={120} />
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        <Button type="submit" className="gap-2" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Сохранить
        </Button>
      </form>
    </div>
  );
}
