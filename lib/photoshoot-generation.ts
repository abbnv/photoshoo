import { readFile } from 'fs/promises';
import path from 'path';
import { type RuntimeAdminConfig, type FormatPreset, type VariationChip } from '@/lib/admin-config';
import { getStorageRootPath } from '@/lib/s3';
import {
  findImpressionOption,
  findSceneDefinition,
  findUseCaseOption,
  normalizeCreativeBrief,
} from '@/lib/photoshoot-brief';

export function buildSelectedFormatPreset(
  adminConfig: RuntimeAdminConfig,
  sceneId?: string,
  formatPresetKey?: string
): FormatPreset | null {
  const explicitPreset = adminConfig.formatPresets.find(
    (preset) => preset.enabled && preset.key === formatPresetKey
  );
  if (explicitPreset) {
    return explicitPreset;
  }

  const scene = findSceneDefinition(adminConfig.sceneDefinitions, sceneId);
  const scenePreset = adminConfig.formatPresets.find(
    (preset) => preset.enabled && preset.key === scene?.formatPresetKey
  );

  if (scenePreset) {
    return scenePreset;
  }

  return (
    adminConfig.formatPresets.find(
      (preset) =>
        preset.enabled &&
        preset.aspectRatio === adminConfig.runtimeSettings.defaultAspectRatio &&
        preset.outputFormat === adminConfig.runtimeSettings.defaultOutputFormat
    ) ??
    adminConfig.formatPresets.find((preset) => preset.enabled) ??
    null
  );
}

export function buildPrompt(adminConfig: RuntimeAdminConfig, rawBrief: unknown, variationIndex?: number): string {
  const brief = normalizeCreativeBrief(rawBrief);
  const useCase = findUseCaseOption(adminConfig.useCaseOptions, brief.useCaseKey);
  const impression = findImpressionOption(adminConfig.impressionOptions, brief.impressionKey);
  const scene = findSceneDefinition(adminConfig.sceneDefinitions, brief.sceneId);
  const formatPreset = buildSelectedFormatPreset(adminConfig, brief.sceneId, brief.formatPresetKey);

  const promptParts = [
    'Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos.',
    'Generate a highly photorealistic portrait of the same person from the reference photos.',
    'Do not change identity, do not beautify into a different person, and do not introduce artificial facial features.',
    'The result must feel naturally photographed, premium, believable, and human.',
    `Use case: ${useCase?.label ?? 'Универсально'}.`,
    `Desired impression: ${impression?.label ?? 'Профессионально'}.`,
    impression?.toneInstruction ?? '',
    `Scene direction: ${scene?.scenePromptTemplate ?? 'Clean premium portrait environment.'}`,
    `Portrait direction: ${scene?.portraitPromptTemplate ?? adminConfig.portraitPromptConfig.basePromptTemplate}`,
    `Location family: ${scene?.locationFamily ?? 'studio'}.`,
    `Lighting family: ${scene?.lightingFamily ?? 'soft portrait light'}.`,
    `Wardrobe direction: ${scene?.wardrobeFamily ?? 'smart casual'}.`,
    `Composition: ${scene?.compositionHint ?? 'clean portrait framing with realistic proportions'}.`,
    adminConfig.portraitPromptConfig.qualityPromptTemplate,
    'Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions.',
    'Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics.',
    'The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait.',
    'Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional.',
    variationIndex === undefined
      ? ''
      : `Create variation ${variationIndex + 1} of the same shoot with subtle changes in pose, framing, background details and micro-expression while preserving the same person and same overall concept.`,
    formatPreset ? `Format target: ${formatPreset.aspectRatio}, ${formatPreset.outputFormat}.` : '',
  ];

  return promptParts.filter(Boolean).join(' ');
}

export function buildVariationPrompt(
  adminConfig: RuntimeAdminConfig,
  rawBrief: unknown,
  chip: VariationChip,
  originalPrompt?: string | null
): string {
  const basePrompt = buildPrompt(adminConfig, rawBrief);
  const chipGuardrailByKey: Record<string, string> = {
    another_scene:
      'Only change the surrounding environment and background staging within the same location family. The background must be visibly different from the approved image. Keep wardrobe, styling, expression, identity, and overall shot character substantially the same.',
    another_outfit:
      'Only change wardrobe and clothing details. Keep the same location, background, scene composition, identity, and lighting as close as possible to the approved shot.',
    another_lighting:
      'Only change the lighting mood and light setup. Keep the same person, same outfit, same scene, same location, and same background composition.',
    another_expression:
      'Only change facial expression and micro-emotion. Keep the same scene, same outfit, same lighting, same background, and same identity.',
  };
  const selectedGuardrail =
    chipGuardrailByKey[chip.key] ??
    'Change only one requested visual dimension and keep all other elements as close as possible to the approved shot.';

  const promptParts = [
    basePrompt,
    'This is a shot-level variation of an already approved photoshoot result.',
    'Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style.',
    'Preserve all non-requested elements from the approved image as closely as possible.',
    'Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only.',
    `Variation instruction: ${chip.instruction}`,
    `Strict guardrail: ${selectedGuardrail}`,
    originalPrompt ? `Original approved prompt context: ${originalPrompt}` : '',
    'Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.',
  ];

  return promptParts.filter(Boolean).join(' ');
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

export async function buildFalInputImage(
  source: { cloudStoragePath?: string | null; url?: string | null },
  requestOrigin: string
): Promise<string | null> {
  let fileBuffer: Buffer | null = null;
  let mimeType = 'image/jpeg';

  if (source.cloudStoragePath) {
    const storageRoot = getStorageRootPath();
    const fullPath = path.join(storageRoot, source.cloudStoragePath);
    fileBuffer = await readFile(fullPath);
    mimeType = getMimeType(fullPath);
  } else if (source.url) {
    const absoluteUrl = source.url.startsWith('http')
      ? source.url
      : `${requestOrigin}${source.url.startsWith('/') ? '' : '/'}${source.url}`;
    const resp = await fetch(absoluteUrl);
    if (!resp.ok) return null;
    const arr = await resp.arrayBuffer();
    fileBuffer = Buffer.from(arr);
    mimeType = resp.headers.get('content-type') || mimeType;
  }

  if (!fileBuffer) return null;
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}
