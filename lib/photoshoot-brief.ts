import type {
  FormatPreset,
  ImpressionOption,
  SceneDefinition,
  UseCaseOption,
  VariationChip,
} from '@/lib/admin-config';

export interface CreativeBriefAnswers {
  useCaseKey?: string;
  impressionKey?: string;
  formatPresetKey?: string;
  sceneId?: string;
}

export interface RankedSceneMatch {
  scene: SceneDefinition;
  score: number;
  reasons: string[];
}

export function normalizeCreativeBrief(value: unknown): CreativeBriefAnswers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    useCaseKey: typeof record.useCaseKey === 'string' ? record.useCaseKey : undefined,
    impressionKey: typeof record.impressionKey === 'string' ? record.impressionKey : undefined,
    formatPresetKey: typeof record.formatPresetKey === 'string' ? record.formatPresetKey : undefined,
    sceneId: typeof record.sceneId === 'string' ? record.sceneId : undefined,
  };
}

export function getEnabledUseCaseOptions(useCaseOptions: UseCaseOption[]): UseCaseOption[] {
  return useCaseOptions.filter((option) => option.enabled);
}

export function getEnabledImpressionOptions(impressionOptions: ImpressionOption[]): ImpressionOption[] {
  return impressionOptions.filter((option) => option.enabled);
}

export function getEnabledSceneDefinitions(sceneDefinitions: SceneDefinition[]): SceneDefinition[] {
  return sceneDefinitions.filter((scene) => scene.enabled).sort((a, b) => b.rankingWeight - a.rankingWeight);
}

export function getEnabledFormatPresets(formatPresets: FormatPreset[]): FormatPreset[] {
  return formatPresets.filter((preset) => preset.enabled);
}

export function findFormatPreset(
  formatPresets: FormatPreset[],
  formatPresetKey?: string
): FormatPreset | undefined {
  return getEnabledFormatPresets(formatPresets).find((preset) => preset.key === formatPresetKey);
}

export function getCanvasFormatOptions(formatPresets: FormatPreset[]): FormatPreset[] {
  const enabledPresets = getEnabledFormatPresets(formatPresets);
  const portraitPreset =
    enabledPresets.find((preset) => preset.aspectRatio === '9:16') ??
    enabledPresets.find((preset) => preset.aspectRatio === '4:5') ??
    enabledPresets[0];
  const landscapePreset =
    enabledPresets.find((preset) => preset.aspectRatio === '16:9') ??
    enabledPresets.find((preset) => preset.aspectRatio === '3:2') ??
    enabledPresets.find((preset) => preset !== portraitPreset);

  return [portraitPreset, landscapePreset].filter((preset): preset is FormatPreset => Boolean(preset));
}

export function getMatchingScenes(
  sceneDefinitions: SceneDefinition[],
  brief: CreativeBriefAnswers
): SceneDefinition[] {
  return getRankedScenes(sceneDefinitions, brief).map((item) => item.scene);
}

export function getRankedScenes(
  sceneDefinitions: SceneDefinition[],
  brief: CreativeBriefAnswers
): RankedSceneMatch[] {
  const enabledScenes = getEnabledSceneDefinitions(sceneDefinitions);

  return enabledScenes
    .map((scene) => {
      const exactUseCaseMatch = Boolean(brief.useCaseKey && scene.supportedUseCases.includes(brief.useCaseKey));
      const exactImpressionMatch = Boolean(
        brief.impressionKey && scene.supportedImpressions.includes(brief.impressionKey)
      );
      const flexibleUseCaseMatch = scene.supportedUseCases.length === 0;
      const flexibleImpressionMatch = scene.supportedImpressions.length === 0;
      const formatMatch = Boolean(brief.formatPresetKey && scene.formatPresetKey === brief.formatPresetKey);

      let score = scene.rankingWeight;
      const reasons: string[] = [];

      if (exactUseCaseMatch) {
        score += 24;
        reasons.push('Подходит под выбранную цель');
      } else if (brief.useCaseKey && flexibleUseCaseMatch) {
        score += 10;
        reasons.push('Универсальный сюжет');
      } else if (brief.useCaseKey) {
        score -= 14;
      }

      if (exactImpressionMatch) {
        score += 24;
        reasons.push('Совпадает по впечатлению');
      } else if (brief.impressionKey && flexibleImpressionMatch) {
        score += 10;
        reasons.push('Гибко работает с разными образами');
      } else if (brief.impressionKey) {
        score -= 14;
      }

      if (formatMatch) {
        score += 6;
        reasons.push('Подходит под выбранный формат');
      } else if (brief.formatPresetKey) {
        score -= 3;
      }

      if (reasons.length === 0 && (brief.useCaseKey || brief.impressionKey || brief.formatPresetKey)) {
        reasons.push('Лучший доступный сюжет для этого набора');
      }

      if (scene.locationFamily) {
        reasons.push(`Локация: ${scene.locationFamily}`);
      }

      return {
        scene,
        score,
        reasons: reasons.slice(0, 2),
      };
    })
    .filter((item): item is RankedSceneMatch => Boolean(item))
    .sort((a, b) => b.score - a.score);
}

export function findUseCaseOption(
  useCaseOptions: UseCaseOption[],
  useCaseKey?: string
): UseCaseOption | undefined {
  return getEnabledUseCaseOptions(useCaseOptions).find((option) => option.key === useCaseKey);
}

export function findImpressionOption(
  impressionOptions: ImpressionOption[],
  impressionKey?: string
): ImpressionOption | undefined {
  return getEnabledImpressionOptions(impressionOptions).find((option) => option.key === impressionKey);
}

export function findSceneDefinition(
  sceneDefinitions: SceneDefinition[],
  sceneId?: string
): SceneDefinition | undefined {
  return getEnabledSceneDefinitions(sceneDefinitions).find((scene) => scene.id === sceneId);
}

export function getCompatibleVariationChips(
  variationChips: VariationChip[],
  brief: CreativeBriefAnswers,
  sceneDefinitions: SceneDefinition[]
): VariationChip[] {
  const scene = findSceneDefinition(sceneDefinitions, brief.sceneId);

  return variationChips
    .filter((chip) => chip.enabled)
    .filter((chip) => {
      const matchesUseCase =
        !brief.useCaseKey ||
        chip.compatibleUseCases.length === 0 ||
        chip.compatibleUseCases.includes(brief.useCaseKey);
      const matchesSceneFamily =
        !scene ||
        chip.compatibleSceneFamilies.length === 0 ||
        chip.compatibleSceneFamilies.includes(scene.locationFamily);

      return matchesUseCase && matchesSceneFamily;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
