import { prisma } from '@/lib/prisma';
import { ADMIN_CONFIG_KEY } from '@/lib/admin';

export interface RuntimeSettingsConfig {
  defaultGenerationsPerPhotoshoot: number;
  defaultAspectRatio: string;
  defaultOutputFormat: string;
  defaultResolutionPreset: string;
}

export interface UseCaseOption {
  key: string;
  label: string;
  enabled: boolean;
  hint: string;
}

export interface ImpressionOption {
  key: string;
  label: string;
  enabled: boolean;
  toneInstruction: string;
}

export interface SceneDefinition {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  supportedUseCases: string[];
  supportedImpressions: string[];
  scenePromptTemplate: string;
  portraitPromptTemplate: string;
  locationFamily: string;
  lightingFamily: string;
  wardrobeFamily: string;
  compositionHint: string;
  formatPresetKey: string;
  rankingWeight: number;
}

export interface VariationChip {
  key: string;
  label: string;
  enabled: boolean;
  instruction: string;
  compatibleSceneFamilies: string[];
  compatibleUseCases: string[];
  displayOrder: number;
}

export interface FormatPreset {
  key: string;
  label: string;
  aspectRatio: string;
  outputFormat: string;
  resolutionPreset: string;
  enabled: boolean;
}

export interface PortraitPromptConfig {
  basePromptTemplate: string;
  editPromptTemplates: string[];
  qualityPromptTemplate: string;
}

export interface BillingTariffConfig {
  key: string;
  label: string;
  description: string;
  priceLabel: string;
  offerId: string;
  currency: 'RUB' | 'USD' | 'EUR';
  tokens: number;
  enabled: boolean;
  displayOrder: number;
}

export interface BillingConfig {
  trialGenerations: number;
  tokenCostPerGeneration: number;
  tariffs: BillingTariffConfig[];
}

export interface RuntimeAdminConfig {
  falApiKey: string;
  openaiApiKey: string;
  lavaApiKey: string;
  lavaWebhookApiKey: string;
  lavaWebhookBasicLogin: string;
  lavaWebhookBasicPassword: string;
  defaultGenerationsPerPhotoshoot: number;
  basePromptTemplate: string;
  editPromptTemplates: string[];
  runtimeSettings: RuntimeSettingsConfig;
  useCaseOptions: UseCaseOption[];
  impressionOptions: ImpressionOption[];
  sceneDefinitions: SceneDefinition[];
  variationChips: VariationChip[];
  formatPresets: FormatPreset[];
  portraitPromptConfig: PortraitPromptConfig;
  billingConfig: BillingConfig;
}

interface AdminConfigRow {
  key: string;
  falApiKey: string | null;
  openaiApiKey: string | null;
  lavaApiKey: string | null;
  lavaWebhookApiKey: string | null;
  lavaWebhookBasicLogin: string | null;
  lavaWebhookBasicPassword: string | null;
  defaultGenerationsPerPhotoshoot: number;
  basePromptTemplate: string;
  editPromptTemplates: unknown;
  runtimeSettings: unknown;
  useCaseOptions: unknown;
  impressionOptions: unknown;
  sceneDefinitions: unknown;
  variationChips: unknown;
  formatPresets: unknown;
  portraitPromptConfig: unknown;
  billingConfig: unknown;
}

export const DEFAULT_BASE_PROMPT_TEMPLATE =
  'Keep the person face and identity exactly the same. Create a photorealistic premium portrait of this same person with natural skin texture, believable lighting, and elegant candid realism.';

export const DEFAULT_EDIT_PROMPT_TEMPLATES = [
  'Keep the person face and identity exactly the same. Create a refined portrait variation with believable {{background}} environment, natural {{lighting}} light, {{expression}} expression, and a polished {{style}} look without changing identity.',
  'Keep the same person exactly. Transform this scene into a premium {{style}} portrait with a natural {{background}} setting, realistic {{lighting}} lighting, and a subtle {{expression}} emotional tone.',
  'Preserve identity perfectly. Generate a professional portrait variation with {{background}} atmosphere, {{lighting}} light quality, {{expression}} expression, and a polished but natural {{style}} aesthetic.',
  'Same face, same identity, same person. Create a candid premium portrait in a {{background}} environment with realistic {{lighting}} light, {{expression}} expression, and clean {{style}} styling.',
];

export const DEFAULT_RUNTIME_SETTINGS: RuntimeSettingsConfig = {
  defaultGenerationsPerPhotoshoot: 12,
  defaultAspectRatio: '9:16',
  defaultOutputFormat: 'png',
  defaultResolutionPreset: 'portrait_hd',
};

export const DEFAULT_USE_CASE_OPTIONS: UseCaseOption[] = [
  { key: 'instagram', label: 'Instagram', enabled: true, hint: 'Личный бренд и профиль' },
  { key: 'avatarka', label: 'Аватарка', enabled: true, hint: 'Аватар и мессенджеры' },
  { key: 'resume', label: 'Резюме', enabled: true, hint: 'CV и hh.ru' },
  { key: 'website', label: 'Сайт', enabled: true, hint: 'Лендинг и about section' },
  { key: 'socials', label: 'Соцсети', enabled: true, hint: 'Контент для публикаций' },
  { key: 'universal', label: 'Универсально', enabled: true, hint: 'Многоцелевой набор' },
];

export const DEFAULT_IMPRESSION_OPTIONS: ImpressionOption[] = [
  { key: 'professional', label: 'Профессионально', enabled: true, toneInstruction: 'Look polished, trustworthy and composed.' },
  { key: 'friendly', label: 'Дружелюбно', enabled: true, toneInstruction: 'Look warm, open and approachable.' },
  { key: 'confident', label: 'Уверенно', enabled: true, toneInstruction: 'Look self-assured, focused and strong.' },
  { key: 'stylish', label: 'Стильно', enabled: true, toneInstruction: 'Look modern, editorial and visually polished.' },
  { key: 'premium', label: 'Премиально', enabled: true, toneInstruction: 'Look elevated, refined and premium.' },
  { key: 'natural', label: 'Естественно', enabled: true, toneInstruction: 'Look authentic, relaxed and natural.' },
];

export const DEFAULT_SCENE_DEFINITIONS: SceneDefinition[] = [
  {
    id: 'minimal-office',
    title: 'Светлый офис',
    subtitle: 'Чистый деловой интерьер с мягким дневным светом',
    enabled: true,
    supportedUseCases: ['resume', 'website', 'avatarka', 'universal'],
    supportedImpressions: ['professional', 'confident', 'friendly'],
    scenePromptTemplate: 'Transform the environment into a premium modern office with clean architecture, glass details, natural daylight, and a calm upscale business atmosphere.',
    portraitPromptTemplate: 'Keep the person exactly the same. Create a natural professional portrait with confident presence, elegant smart business styling, realistic skin texture, and believable candid body language.',
    locationFamily: 'office',
    lightingFamily: 'soft_daylight',
    wardrobeFamily: 'business',
    compositionHint: 'waist up portrait with clean negative space',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 100,
  },
  {
    id: 'studio-classic',
    title: 'Студийная классика',
    subtitle: 'Нейтральная студия и мягкий портретный свет',
    enabled: true,
    supportedUseCases: ['avatarka', 'resume', 'website', 'universal'],
    supportedImpressions: ['professional', 'premium', 'natural'],
    scenePromptTemplate: 'Use a refined neutral studio environment with seamless backdrop, soft controlled light, minimal distractions, and premium portrait studio realism.',
    portraitPromptTemplate: 'Keep the face exactly the same. Create a timeless premium headshot with natural expression, crisp realistic detail, soft flattering light, and clean professional styling without plastic retouching.',
    locationFamily: 'studio',
    lightingFamily: 'portrait_softbox',
    wardrobeFamily: 'smart_casual',
    compositionHint: 'tight portrait framing with refined headshot look',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 95,
  },
  {
    id: 'city-lifestyle',
    title: 'Городской lifestyle',
    subtitle: 'Современный городской фон и живой профессиональный образ',
    enabled: true,
    supportedUseCases: ['instagram', 'socials', 'website', 'universal'],
    supportedImpressions: ['confident', 'stylish', 'friendly'],
    scenePromptTemplate: 'Transform the scene into a candid luxury lifestyle moment in an upscale city environment with clean architecture, glass buildings, soft urban depth, and expensive but natural atmosphere.',
    portraitPromptTemplate: 'Keep the person identity exactly the same. Create a candid confident lifestyle portrait with elegant smart casual styling, natural lighting, slightly imperfect framing, subtle influencer polish, and successful entrepreneur energy.',
    locationFamily: 'city',
    lightingFamily: 'natural_outdoor',
    wardrobeFamily: 'smart_casual',
    compositionHint: 'portrait with shallow depth and environmental context',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 90,
  },
  {
    id: 'glass-boardroom',
    title: 'Премиальная переговорка',
    subtitle: 'Стекло, архитектура и уверенный корпоративный вайб',
    enabled: true,
    supportedUseCases: ['resume', 'website', 'avatarka', 'universal'],
    supportedImpressions: ['professional', 'confident', 'premium'],
    scenePromptTemplate: 'Create an upscale executive boardroom setting with glass walls, premium materials, strong architectural lines, and a discreet high-status corporate atmosphere.',
    portraitPromptTemplate: 'Keep the face identical. Create an executive portrait with calm authority, expensive but natural business styling, realistic skin detail, and confident post-call energy.',
    locationFamily: 'office',
    lightingFamily: 'window_contrast',
    wardrobeFamily: 'executive',
    compositionHint: 'mid shot portrait with architectural depth and confident stance',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 98,
  },
  {
    id: 'warm-editorial-studio',
    title: 'Тёплая editorial-студия',
    subtitle: 'Мягкий тёплый свет и журнальная подача без перегруза',
    enabled: true,
    supportedUseCases: ['instagram', 'website', 'socials', 'universal'],
    supportedImpressions: ['stylish', 'premium', 'natural'],
    scenePromptTemplate: 'Create a warm editorial studio setup with textured backdrop, soft amber highlights, depth, and premium fashion-photography atmosphere.',
    portraitPromptTemplate: 'Keep the same face and identity. Create a stylish editorial portrait with natural skin, refined expression, softly polished Instagram-ready finish, and modern premium energy without overprocessing.',
    locationFamily: 'studio',
    lightingFamily: 'warm_editorial',
    wardrobeFamily: 'elevated_casual',
    compositionHint: 'fashion-inspired portrait with clean composition and subtle attitude',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 92,
  },
  {
    id: 'dark-premium-studio',
    title: 'Тёмная premium-студия',
    subtitle: 'Контрастный свет и дорогой, собранный образ',
    enabled: true,
    supportedUseCases: ['avatarka', 'website', 'socials', 'universal'],
    supportedImpressions: ['premium', 'confident', 'stylish'],
    scenePromptTemplate: 'Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff.',
    portraitPromptTemplate: 'Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence.',
    locationFamily: 'studio',
    lightingFamily: 'cinematic_contrast',
    wardrobeFamily: 'premium_dark',
    compositionHint: 'tight portrait framing with sculpted light and premium mood',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 94,
  },
  {
    id: 'sunlit-cafe',
    title: 'Светлое кафе',
    subtitle: 'Живой городской интерьер для тёплого личного бренда',
    enabled: true,
    supportedUseCases: ['instagram', 'socials', 'website', 'universal'],
    supportedImpressions: ['friendly', 'natural', 'stylish'],
    scenePromptTemplate: 'Transform the setting into a bright upscale cafe with airy daylight, tasteful interior design, lifestyle energy, and soft premium city atmosphere.',
    portraitPromptTemplate: 'Keep the same face. Create a relaxed but polished lifestyle portrait with approachable confidence, natural smile or soft expression, clean color, and believable candid realism.',
    locationFamily: 'interior',
    lightingFamily: 'sunlit_indoor',
    wardrobeFamily: 'smart_casual',
    compositionHint: 'environmental portrait with lifestyle framing and gentle depth of field',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 89,
  },
  {
    id: 'founder-home-office',
    title: 'Домашний office founder',
    subtitle: 'Спокойный интерьер с ощущением личного рабочего пространства',
    enabled: true,
    supportedUseCases: ['website', 'socials', 'instagram', 'universal'],
    supportedImpressions: ['friendly', 'natural', 'confident'],
    scenePromptTemplate: 'Create a refined founder home-office environment with tasteful workspace details, soft daylight, depth, and personal brand authenticity.',
    portraitPromptTemplate: 'Keep the same identity. Create a founder-style portrait with relaxed confidence, authentic posture, premium casual styling, and realistic personal-brand photography feel.',
    locationFamily: 'interior',
    lightingFamily: 'soft_window',
    wardrobeFamily: 'founder_casual',
    compositionHint: 'half-body portrait with contextual workspace details',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 88,
  },
  {
    id: 'green-park-morning',
    title: 'Парк утром',
    subtitle: 'Свежий естественный свет и спокойный outdoor-портрет',
    enabled: true,
    supportedUseCases: ['instagram', 'socials', 'universal'],
    supportedImpressions: ['natural', 'friendly', 'confident'],
    scenePromptTemplate: 'Place the person in a fresh morning park setting with soft natural daylight, gentle greenery blur, and premium outdoor calm.',
    portraitPromptTemplate: 'Keep the person exactly the same. Create a natural outdoor portrait with realistic skin, relaxed confidence, believable daylight, and non-plastic premium realism.',
    locationFamily: 'outdoor',
    lightingFamily: 'morning_daylight',
    wardrobeFamily: 'casual_clean',
    compositionHint: 'portrait with soft bokeh and clean natural background separation',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 84,
  },
  {
    id: 'urban-evening-editorial',
    title: 'Вечерний urban editorial',
    subtitle: 'Городские огни, глубина и модный визуальный тон',
    enabled: true,
    supportedUseCases: ['instagram', 'socials', 'website', 'universal'],
    supportedImpressions: ['stylish', 'premium', 'confident'],
    scenePromptTemplate: 'Create an upscale evening city moment with premium architecture lights, cinematic depth, modern metropolitan energy, and editorial sophistication.',
    portraitPromptTemplate: 'Keep the face identical. Create a stylish evening editorial portrait with natural confidence, luxury lifestyle vibe, slightly candid framing, and polished but believable realism.',
    locationFamily: 'city',
    lightingFamily: 'evening_city',
    wardrobeFamily: 'editorial_city',
    compositionHint: 'vertical portrait with cinematic city depth and confident framing',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 91,
  },
  {
    id: 'neutral-cream-backdrop',
    title: 'Кремовый backdrop',
    subtitle: 'Спокойный нейтральный фон для универсального headshot',
    enabled: true,
    supportedUseCases: ['avatarka', 'resume', 'website', 'universal'],
    supportedImpressions: ['professional', 'natural', 'friendly'],
    scenePromptTemplate: 'Use a clean cream backdrop with minimal setup, premium simplicity, soft tonal separation, and elegant studio restraint.',
    portraitPromptTemplate: 'Keep the same person exactly. Create a clean premium headshot with balanced expression, natural realism, subtle retouching, and crisp but human skin detail.',
    locationFamily: 'studio',
    lightingFamily: 'soft_even',
    wardrobeFamily: 'universal_clean',
    compositionHint: 'clean close-up headshot with minimal distractions',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 87,
  },
  {
    id: 'conference-speaker-lobby',
    title: 'Lobby спикера',
    subtitle: 'Современное пространство конференции для экспертного образа',
    enabled: true,
    supportedUseCases: ['website', 'resume', 'socials', 'universal'],
    supportedImpressions: ['professional', 'confident', 'friendly'],
    scenePromptTemplate: 'Create a modern conference lobby environment with premium event design, glass and soft interior depth, and credible expert-speaker atmosphere.',
    portraitPromptTemplate: 'Keep the face unchanged. Create an expert speaker portrait with approachable authority, natural posture, clean professional styling, and realistic high-end event photography feel.',
    locationFamily: 'office',
    lightingFamily: 'event_soft',
    wardrobeFamily: 'speaker_smart',
    compositionHint: 'portrait with open background and credible expert presence',
    formatPresetKey: 'portrait_9x16',
    rankingWeight: 93,
  },
];

export const DEFAULT_VARIATION_CHIPS: VariationChip[] = [
  {
    key: 'another_scene',
    label: 'Другая сцена',
    enabled: true,
    instruction:
      'Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup.',
    compatibleSceneFamilies: ['office', 'studio', 'city', 'interior', 'outdoor'],
    compatibleUseCases: ['instagram', 'avatarka', 'resume', 'website', 'socials', 'universal'],
    displayOrder: 1,
  },
  {
    key: 'another_outfit',
    label: 'Другая одежда',
    enabled: true,
    instruction:
      'Keep the same person, same scene, same location, same background, same lighting, and same general composition. Change only the outfit and wardrobe styling to another believable option that fits the same shoot concept. Do not noticeably alter the environment or expression.',
    compatibleSceneFamilies: ['office', 'studio', 'city', 'interior', 'outdoor'],
    compatibleUseCases: ['instagram', 'avatarka', 'resume', 'website', 'socials', 'universal'],
    displayOrder: 2,
  },
  {
    key: 'another_lighting',
    label: 'Другой свет',
    enabled: true,
    instruction:
      'Keep the same person, same outfit, same location, same background composition, and same overall shot. Change only the lighting style and light mood. Preserve the scene and wardrobe almost exactly, while giving the photo a different but realistic lighting setup.',
    compatibleSceneFamilies: ['office', 'studio', 'city', 'interior', 'outdoor'],
    compatibleUseCases: ['instagram', 'avatarka', 'resume', 'website', 'socials', 'universal'],
    displayOrder: 3,
  },
  {
    key: 'another_expression',
    label: 'Другое выражение',
    enabled: true,
    instruction:
      'Keep the same person, same scene, same outfit, same background, and same lighting. Change only the facial expression and micro-emotion while preserving realism, identity, and the rest of the shot as consistently as possible.',
    compatibleSceneFamilies: ['office', 'studio', 'city', 'interior', 'outdoor'],
    compatibleUseCases: ['instagram', 'avatarka', 'resume', 'website', 'socials', 'universal'],
    displayOrder: 4,
  },
];

export const DEFAULT_FORMAT_PRESETS: FormatPreset[] = [
  { key: 'portrait_9x16', label: 'Портрет 9:16', aspectRatio: '9:16', outputFormat: 'png', resolutionPreset: 'portrait_hd', enabled: true },
  { key: 'landscape_16x9', label: 'Горизонталь 16:9', aspectRatio: '16:9', outputFormat: 'png', resolutionPreset: 'landscape_hd', enabled: true },
  { key: 'avatar_1x1', label: 'Аватар 1:1', aspectRatio: '1:1', outputFormat: 'png', resolutionPreset: 'square_hd', enabled: true },
  { key: 'profile_4x5', label: 'Профиль 4:5', aspectRatio: '4:5', outputFormat: 'png', resolutionPreset: 'portrait_web', enabled: true },
];

export const DEFAULT_PORTRAIT_PROMPT_CONFIG: PortraitPromptConfig = {
  basePromptTemplate: DEFAULT_BASE_PROMPT_TEMPLATE,
  editPromptTemplates: DEFAULT_EDIT_PROMPT_TEMPLATES,
  qualityPromptTemplate:
    'Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel.',
};

export const DEFAULT_BILLING_TARIFFS: BillingTariffConfig[] = [
  {
    key: 'starter_20',
    label: '20 генераций',
    description: 'Пакет для первых запусков',
    priceLabel: '990 рублей',
    offerId: '',
    currency: 'RUB',
    tokens: 20,
    enabled: true,
    displayOrder: 1,
  },
  {
    key: 'pro_60',
    label: '60 генераций',
    description: 'Оптимальный пакет для регулярных генераций',
    priceLabel: '1890 рублей',
    offerId: '',
    currency: 'RUB',
    tokens: 60,
    enabled: true,
    displayOrder: 2,
  },
  {
    key: 'max_150',
    label: '150 генераций',
    description: 'Максимум генераций по лучшей цене',
    priceLabel: '2490 рублей',
    offerId: '',
    currency: 'RUB',
    tokens: 150,
    enabled: true,
    displayOrder: 3,
  },
];

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
  trialGenerations: 10,
  tokenCostPerGeneration: 1,
  tariffs: DEFAULT_BILLING_TARIFFS,
};

const DEFAULT_BILLING_TARIFFS_BY_KEY = new Map(
  DEFAULT_BILLING_TARIFFS.map((tariff) => [tariff.key, tariff])
);

const DEFAULT_ADMIN_SECTIONS = {
  runtimeSettings: DEFAULT_RUNTIME_SETTINGS,
  useCaseOptions: DEFAULT_USE_CASE_OPTIONS,
  impressionOptions: DEFAULT_IMPRESSION_OPTIONS,
  sceneDefinitions: DEFAULT_SCENE_DEFINITIONS,
  variationChips: DEFAULT_VARIATION_CHIPS,
  formatPresets: DEFAULT_FORMAT_PRESETS,
  portraitPromptConfig: DEFAULT_PORTRAIT_PROMPT_CONFIG,
  billingConfig: DEFAULT_BILLING_CONFIG,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
}

function toArrayOfObjects<T>(value: unknown, fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;
  const objects = value.filter((item): item is T => isObject(item));
  return objects.length > 0 ? objects : fallback;
}

function toRuntimeSettings(value: unknown, fallbackDefaultGenerations: number): RuntimeSettingsConfig {
  if (!isObject(value)) {
    return {
      ...DEFAULT_RUNTIME_SETTINGS,
      defaultGenerationsPerPhotoshoot: fallbackDefaultGenerations,
    };
  }

  return {
    defaultGenerationsPerPhotoshoot:
      typeof value.defaultGenerationsPerPhotoshoot === 'number' && value.defaultGenerationsPerPhotoshoot > 0
        ? value.defaultGenerationsPerPhotoshoot
        : fallbackDefaultGenerations,
    defaultAspectRatio:
      typeof value.defaultAspectRatio === 'string' && value.defaultAspectRatio.trim()
        ? value.defaultAspectRatio.trim()
        : DEFAULT_RUNTIME_SETTINGS.defaultAspectRatio,
    defaultOutputFormat:
      typeof value.defaultOutputFormat === 'string' && value.defaultOutputFormat.trim()
        ? value.defaultOutputFormat.trim()
        : DEFAULT_RUNTIME_SETTINGS.defaultOutputFormat,
    defaultResolutionPreset:
      typeof value.defaultResolutionPreset === 'string' && value.defaultResolutionPreset.trim()
        ? value.defaultResolutionPreset.trim()
        : DEFAULT_RUNTIME_SETTINGS.defaultResolutionPreset,
  };
}

function toPortraitPromptConfig(value: unknown, fallbackBasePromptTemplate: string, fallbackEditPromptTemplates: string[]): PortraitPromptConfig {
  if (!isObject(value)) {
    return {
      ...DEFAULT_PORTRAIT_PROMPT_CONFIG,
      basePromptTemplate: fallbackBasePromptTemplate,
      editPromptTemplates: fallbackEditPromptTemplates,
    };
  }

  const editPromptTemplates = toStringArray(value.editPromptTemplates);

  return {
    basePromptTemplate:
      typeof value.basePromptTemplate === 'string' && value.basePromptTemplate.trim()
        ? value.basePromptTemplate.trim()
        : fallbackBasePromptTemplate,
    editPromptTemplates: editPromptTemplates.length > 0 ? editPromptTemplates : fallbackEditPromptTemplates,
    qualityPromptTemplate:
      typeof value.qualityPromptTemplate === 'string' && value.qualityPromptTemplate.trim()
        ? value.qualityPromptTemplate.trim()
        : DEFAULT_PORTRAIT_PROMPT_CONFIG.qualityPromptTemplate,
  };
}

function toBillingConfig(value: unknown): BillingConfig {
  if (!isObject(value)) {
    return DEFAULT_BILLING_CONFIG;
  }

  const trialGenerationsRaw = Number(value.trialGenerations);
  const tokenCostRaw = Number(value.tokenCostPerGeneration);
  const tariffsRaw = Array.isArray(value.tariffs) ? value.tariffs : [];

  const tariffs: BillingTariffConfig[] = tariffsRaw
    .filter((item): item is Record<string, unknown> => isObject(item))
    .map((item, index) => {
      const key = String(item.key ?? '').trim();
      const defaults = DEFAULT_BILLING_TARIFFS_BY_KEY.get(key);
      const currency: BillingTariffConfig['currency'] =
        item.currency === 'RUB' || item.currency === 'USD' || item.currency === 'EUR'
          ? item.currency
          : defaults?.currency ?? 'USD';

      return {
        key,
        label: String(item.label ?? '').trim() || defaults?.label || '',
        description: String(item.description ?? '').trim() || defaults?.description || '',
        priceLabel: String(item.priceLabel ?? '').trim() || defaults?.priceLabel || '',
        offerId: String(item.offerId ?? '').trim(),
        currency,
        tokens: Math.max(1, Math.round(Number(item.tokens ?? defaults?.tokens ?? 1))),
        enabled: item.enabled !== false,
        displayOrder: Math.max(1, Math.round(Number(item.displayOrder ?? index + 1))),
      };
    })
    .filter((item) => item.key && item.label);

  return {
    trialGenerations: Number.isFinite(trialGenerationsRaw)
      ? Math.max(0, Math.round(trialGenerationsRaw))
      : DEFAULT_BILLING_CONFIG.trialGenerations,
    tokenCostPerGeneration: Number.isFinite(tokenCostRaw)
      ? Math.max(1, Math.round(tokenCostRaw))
      : DEFAULT_BILLING_CONFIG.tokenCostPerGeneration,
    tariffs: tariffs.length > 0 ? tariffs : DEFAULT_BILLING_CONFIG.tariffs,
  };
}

function sqlJson(value: unknown): PrismaJsonParameter {
  return JSON.stringify(value);
}

type PrismaJsonParameter = string;

export async function getOrCreateAdminConfig() {
  await prisma.$executeRaw`
    INSERT INTO admin_configs (
      key,
      lava_api_key,
      lava_webhook_api_key,
      lava_webhook_basic_login,
      lava_webhook_basic_password,
      default_generations_per_photoshoot,
      base_prompt_template,
      edit_prompt_templates,
      runtime_settings,
      use_case_options,
      impression_options,
      scene_definitions,
      variation_chips,
      format_presets,
      portrait_prompt_config,
      billing_config,
      created_at,
      updated_at
    )
    VALUES (
      ${ADMIN_CONFIG_KEY},
      NULL,
      NULL,
      NULL,
      NULL,
      ${DEFAULT_RUNTIME_SETTINGS.defaultGenerationsPerPhotoshoot},
      ${DEFAULT_BASE_PROMPT_TEMPLATE},
      ${sqlJson(DEFAULT_EDIT_PROMPT_TEMPLATES)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.runtimeSettings)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.useCaseOptions)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.impressionOptions)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.sceneDefinitions)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.variationChips)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.formatPresets)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.portraitPromptConfig)}::jsonb,
      ${sqlJson(DEFAULT_ADMIN_SECTIONS.billingConfig)}::jsonb,
      NOW(),
      NOW()
    )
    ON CONFLICT (key) DO NOTHING
  `;

  const rows = await prisma.$queryRaw<AdminConfigRow[]>`
    SELECT
      key,
      fal_api_key AS "falApiKey",
      openai_api_key AS "openaiApiKey",
      lava_api_key AS "lavaApiKey",
      lava_webhook_api_key AS "lavaWebhookApiKey",
      lava_webhook_basic_login AS "lavaWebhookBasicLogin",
      lava_webhook_basic_password AS "lavaWebhookBasicPassword",
      default_generations_per_photoshoot AS "defaultGenerationsPerPhotoshoot",
      base_prompt_template AS "basePromptTemplate",
      edit_prompt_templates AS "editPromptTemplates",
      runtime_settings AS "runtimeSettings",
      use_case_options AS "useCaseOptions",
      impression_options AS "impressionOptions",
      scene_definitions AS "sceneDefinitions",
      variation_chips AS "variationChips",
      format_presets AS "formatPresets",
      portrait_prompt_config AS "portraitPromptConfig",
      billing_config AS "billingConfig"
    FROM admin_configs
    WHERE key = ${ADMIN_CONFIG_KEY}
    LIMIT 1
  `;

  if (!rows?.[0]) {
    return {
      key: ADMIN_CONFIG_KEY,
      falApiKey: null,
      openaiApiKey: null,
      lavaApiKey: null,
      lavaWebhookApiKey: null,
      lavaWebhookBasicLogin: null,
      lavaWebhookBasicPassword: null,
      defaultGenerationsPerPhotoshoot: DEFAULT_RUNTIME_SETTINGS.defaultGenerationsPerPhotoshoot,
      basePromptTemplate: DEFAULT_BASE_PROMPT_TEMPLATE,
      editPromptTemplates: DEFAULT_EDIT_PROMPT_TEMPLATES,
      runtimeSettings: DEFAULT_ADMIN_SECTIONS.runtimeSettings,
      useCaseOptions: DEFAULT_ADMIN_SECTIONS.useCaseOptions,
      impressionOptions: DEFAULT_ADMIN_SECTIONS.impressionOptions,
      sceneDefinitions: DEFAULT_ADMIN_SECTIONS.sceneDefinitions,
      variationChips: DEFAULT_ADMIN_SECTIONS.variationChips,
      formatPresets: DEFAULT_ADMIN_SECTIONS.formatPresets,
      portraitPromptConfig: DEFAULT_ADMIN_SECTIONS.portraitPromptConfig,
      billingConfig: DEFAULT_ADMIN_SECTIONS.billingConfig,
    };
  }

  return rows[0];
}

export function buildEditableAdminConfig(config: AdminConfigRow | Awaited<ReturnType<typeof getOrCreateAdminConfig>>) {
  const fallbackEditPromptTemplates = toStringArray(config.editPromptTemplates);
  const runtimeSettings = toRuntimeSettings(config.runtimeSettings, config.defaultGenerationsPerPhotoshoot ?? DEFAULT_RUNTIME_SETTINGS.defaultGenerationsPerPhotoshoot);
  const portraitPromptConfig = toPortraitPromptConfig(
    config.portraitPromptConfig,
    (config.basePromptTemplate ?? DEFAULT_BASE_PROMPT_TEMPLATE).trim() || DEFAULT_BASE_PROMPT_TEMPLATE,
    fallbackEditPromptTemplates.length > 0 ? fallbackEditPromptTemplates : DEFAULT_EDIT_PROMPT_TEMPLATES
  );
  const billingConfig = toBillingConfig(config.billingConfig);

  return {
    falApiKey: config.falApiKey ?? '',
    openaiApiKey: config.openaiApiKey ?? '',
    lavaApiKey: config.lavaApiKey ?? '',
    lavaWebhookApiKey: config.lavaWebhookApiKey ?? '',
    lavaWebhookBasicLogin: config.lavaWebhookBasicLogin ?? '',
    lavaWebhookBasicPassword: config.lavaWebhookBasicPassword ?? '',
    runtimeSettings,
    useCaseOptions: toArrayOfObjects<UseCaseOption>(config.useCaseOptions, DEFAULT_USE_CASE_OPTIONS),
    impressionOptions: toArrayOfObjects<ImpressionOption>(config.impressionOptions, DEFAULT_IMPRESSION_OPTIONS),
    sceneDefinitions: toArrayOfObjects<SceneDefinition>(config.sceneDefinitions, DEFAULT_SCENE_DEFINITIONS),
    variationChips: toArrayOfObjects<VariationChip>(config.variationChips, DEFAULT_VARIATION_CHIPS),
    formatPresets: toArrayOfObjects<FormatPreset>(config.formatPresets, DEFAULT_FORMAT_PRESETS),
    portraitPromptConfig,
    billingConfig,
    defaultGenerationsPerPhotoshoot: runtimeSettings.defaultGenerationsPerPhotoshoot,
    basePromptTemplate: portraitPromptConfig.basePromptTemplate,
    editPromptTemplates: portraitPromptConfig.editPromptTemplates,
  };
}

export async function getRuntimeAdminConfig(): Promise<RuntimeAdminConfig> {
  const rawConfig = await getOrCreateAdminConfig();
  const editableConfig = buildEditableAdminConfig(rawConfig);
  const falApiKey = (editableConfig.falApiKey ?? process.env.FAL_KEY ?? process.env.FAL_API_KEY ?? '').trim();
  const openaiApiKey = (editableConfig.openaiApiKey ?? process.env.OPENAI_API_KEY ?? '').trim();
  const lavaApiKey = (editableConfig.lavaApiKey ?? process.env.LAVA_API_KEY ?? '').trim();
  const lavaWebhookApiKey = (editableConfig.lavaWebhookApiKey ?? process.env.LAVA_WEBHOOK_API_KEY ?? '').trim();
  const lavaWebhookBasicLogin = (editableConfig.lavaWebhookBasicLogin ?? process.env.LAVA_WEBHOOK_BASIC_LOGIN ?? '').trim();
  const lavaWebhookBasicPassword = editableConfig.lavaWebhookBasicPassword ?? process.env.LAVA_WEBHOOK_BASIC_PASSWORD ?? '';

  return {
    falApiKey,
    openaiApiKey,
    lavaApiKey,
    lavaWebhookApiKey,
    lavaWebhookBasicLogin,
    lavaWebhookBasicPassword,
    defaultGenerationsPerPhotoshoot: editableConfig.runtimeSettings.defaultGenerationsPerPhotoshoot,
    basePromptTemplate: editableConfig.portraitPromptConfig.basePromptTemplate,
    editPromptTemplates: editableConfig.portraitPromptConfig.editPromptTemplates,
    runtimeSettings: editableConfig.runtimeSettings,
    useCaseOptions: editableConfig.useCaseOptions,
    impressionOptions: editableConfig.impressionOptions,
    sceneDefinitions: editableConfig.sceneDefinitions,
    variationChips: editableConfig.variationChips,
    formatPresets: editableConfig.formatPresets,
    portraitPromptConfig: editableConfig.portraitPromptConfig,
    billingConfig: editableConfig.billingConfig,
  };
}
