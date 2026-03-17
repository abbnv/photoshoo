export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ADMIN_CONFIG_KEY, isAdminEmail } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_BILLING_CONFIG,
  DEFAULT_EDIT_PROMPT_TEMPLATES,
  DEFAULT_PORTRAIT_PROMPT_CONFIG,
  DEFAULT_RUNTIME_SETTINGS,
  buildEditableAdminConfig,
  getOrCreateAdminConfig,
} from '@/lib/admin-config';

function getSessionEmail(session: any): string | undefined {
  return session?.user?.email ?? undefined;
}

function parseJsonSection<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (value && typeof value === 'object') {
    return value as T;
  }
  return fallback;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdminEmail(getSessionEmail(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await getOrCreateAdminConfig();
    const editableConfig = buildEditableAdminConfig(config);

    return NextResponse.json(editableConfig);
  } catch (error: any) {
    console.error('Get admin config error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdminEmail(getSessionEmail(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const runtimeSettings = parseJsonSection(body?.runtimeSettings, DEFAULT_RUNTIME_SETTINGS);
    const portraitPromptConfig = parseJsonSection(body?.portraitPromptConfig, DEFAULT_PORTRAIT_PROMPT_CONFIG);
    const useCaseOptions = parseJsonSection(body?.useCaseOptions, []);
    const impressionOptions = parseJsonSection(body?.impressionOptions, []);
    const sceneDefinitions = parseJsonSection(body?.sceneDefinitions, []);
    const variationChips = parseJsonSection(body?.variationChips, []);
    const formatPresets = parseJsonSection(body?.formatPresets, []);
    const billingConfig = parseJsonSection(body?.billingConfig, DEFAULT_BILLING_CONFIG);

    const defaultGenerations = Number(runtimeSettings?.defaultGenerationsPerPhotoshoot);
    if (!Number.isFinite(defaultGenerations) || defaultGenerations < 1 || defaultGenerations > 100) {
      return NextResponse.json(
        { error: 'runtimeSettings.defaultGenerationsPerPhotoshoot must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    const basePromptTemplate =
      typeof portraitPromptConfig?.basePromptTemplate === 'string' && portraitPromptConfig.basePromptTemplate.trim()
        ? portraitPromptConfig.basePromptTemplate.trim()
        : DEFAULT_PORTRAIT_PROMPT_CONFIG.basePromptTemplate;
    const editPromptTemplates = Array.isArray(portraitPromptConfig?.editPromptTemplates)
      ? portraitPromptConfig.editPromptTemplates.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : DEFAULT_EDIT_PROMPT_TEMPLATES;
    const normalizedPortraitPromptConfig = {
      ...portraitPromptConfig,
      basePromptTemplate,
      editPromptTemplates: editPromptTemplates.length > 0 ? editPromptTemplates : DEFAULT_EDIT_PROMPT_TEMPLATES,
    };

    const falApiKey = String(body?.falApiKey ?? '').trim() || null;
    const openaiApiKey = String(body?.openaiApiKey ?? '').trim() || null;
    const lavaApiKey = String(body?.lavaApiKey ?? '').trim() || null;
    const lavaWebhookApiKey = String(body?.lavaWebhookApiKey ?? '').trim() || null;
    const lavaWebhookBasicLogin = String(body?.lavaWebhookBasicLogin ?? '').trim() || null;
    const lavaWebhookBasicPassword = String(body?.lavaWebhookBasicPassword ?? '') || null;

    await prisma.$executeRaw`
      INSERT INTO admin_configs (
        key,
        fal_api_key,
        openai_api_key,
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
        ${falApiKey},
        ${openaiApiKey},
        ${lavaApiKey},
        ${lavaWebhookApiKey},
        ${lavaWebhookBasicLogin},
        ${lavaWebhookBasicPassword},
        ${Math.round(defaultGenerations)},
        ${basePromptTemplate},
        ${JSON.stringify(normalizedPortraitPromptConfig.editPromptTemplates)}::jsonb,
        ${JSON.stringify(runtimeSettings)}::jsonb,
        ${JSON.stringify(useCaseOptions)}::jsonb,
        ${JSON.stringify(impressionOptions)}::jsonb,
        ${JSON.stringify(sceneDefinitions)}::jsonb,
        ${JSON.stringify(variationChips)}::jsonb,
        ${JSON.stringify(formatPresets)}::jsonb,
        ${JSON.stringify(normalizedPortraitPromptConfig)}::jsonb,
        ${JSON.stringify(billingConfig)}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (key)
      DO UPDATE SET
        fal_api_key = EXCLUDED.fal_api_key,
        openai_api_key = EXCLUDED.openai_api_key,
        lava_api_key = EXCLUDED.lava_api_key,
        lava_webhook_api_key = EXCLUDED.lava_webhook_api_key,
        lava_webhook_basic_login = EXCLUDED.lava_webhook_basic_login,
        lava_webhook_basic_password = EXCLUDED.lava_webhook_basic_password,
        default_generations_per_photoshoot = EXCLUDED.default_generations_per_photoshoot,
        base_prompt_template = EXCLUDED.base_prompt_template,
        edit_prompt_templates = EXCLUDED.edit_prompt_templates,
        runtime_settings = EXCLUDED.runtime_settings,
        use_case_options = EXCLUDED.use_case_options,
        impression_options = EXCLUDED.impression_options,
        scene_definitions = EXCLUDED.scene_definitions,
        variation_chips = EXCLUDED.variation_chips,
        format_presets = EXCLUDED.format_presets,
        portrait_prompt_config = EXCLUDED.portrait_prompt_config,
        billing_config = EXCLUDED.billing_config,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      defaultGenerationsPerPhotoshoot: Math.round(defaultGenerations),
    });
  } catch (error: any) {
    console.error('Update admin config error:', error);
    return NextResponse.json({ error: 'Failed to update admin config' }, { status: 500 });
  }
}
