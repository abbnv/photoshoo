export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import { buildFalInputImage, buildSelectedFormatPreset, buildVariationPrompt } from '@/lib/photoshoot-generation';
import { normalizeCreativeBrief, getCompatibleVariationChips } from '@/lib/photoshoot-brief';
import { prisma } from '@/lib/prisma';
import { addTokens, consumeTokensOrThrow, InsufficientTokensError } from '@/lib/token-balance';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let tokenDebited = false;
  let refundUserId = 0;
  let refundMeta: Record<string, unknown> = {};
  let refundAmount = 1;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const userId = Number((session.user as any)?.id);
    const photoshootId = Number(params?.id);
    const body = await request.json().catch(() => ({}));
    const generatedImageId = Number(body?.generatedImageId);
    const chipKey = typeof body?.chipKey === 'string' ? body.chipKey : '';

    if (!Number.isFinite(photoshootId) || !Number.isFinite(generatedImageId) || !chipKey) {
      return Response.json({ error: 'Некорректные параметры вариации' }, { status: 400 });
    }

    const photoshoot = await prisma.photoshoot.findFirst({
      where: { id: photoshootId, userId },
      include: {
        sourceImages: { orderBy: { fileOrder: 'asc' } },
        generatedImages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!photoshoot) {
      return Response.json({ error: 'Фотосессия не найдена' }, { status: 404 });
    }

    const targetImage = photoshoot.generatedImages.find((image) => image.id === generatedImageId);
    if (!targetImage) {
      return Response.json({ error: 'Кадр для вариации не найден' }, { status: 404 });
    }

    if ((photoshoot.sourceImages?.length ?? 0) === 0) {
      return Response.json({ error: 'У фотосессии нет исходных фото' }, { status: 400 });
    }

    const adminConfig = await getRuntimeAdminConfig();
    const tokenCost = Math.max(1, Math.round(adminConfig.billingConfig.tokenCostPerGeneration ?? 1));
    refundUserId = userId;
    refundAmount = tokenCost;
    refundMeta = { photoshootId, chipKey };
    const brief = normalizeCreativeBrief(photoshoot.quizAnswers);
    const compatibleChips = getCompatibleVariationChips(
      adminConfig.variationChips,
      brief,
      adminConfig.sceneDefinitions
    );
    const selectedChip = compatibleChips.find((chip) => chip.key === chipKey);

    if (!selectedChip) {
      return Response.json({ error: 'Этот чип недоступен для текущей фотосессии' }, { status: 400 });
    }

    const falKey = adminConfig.falApiKey;
    if (!falKey || falKey === 'placeholder_fal_api_key') {
      return Response.json({ error: 'FAL_KEY не настроен. Добавьте ключ fal.ai API.' }, { status: 400 });
    }

    try {
      await consumeTokensOrThrow(userId, tokenCost, 'variation', { photoshootId, chipKey });
      tokenDebited = true;
    } catch (error) {
      if (error instanceof InsufficientTokensError) {
        return Response.json(
          {
            error: `Недостаточно токенов. Нужно ${tokenCost}, доступно ${error.balance}.`,
            code: 'INSUFFICIENT_TOKENS',
            balance: error.balance,
            required: tokenCost,
          },
          { status: 402 }
        );
      }
      throw error;
    }

    const requestOrigin = new URL(request.url).origin;
    const includeTargetImageReference = selectedChip.key !== 'another_scene';
    const referenceSources = [
      ...(includeTargetImageReference ? [{ cloudStoragePath: null, url: targetImage.url }] : []),
      ...photoshoot.sourceImages.map((img) => ({
        cloudStoragePath: img.cloudStoragePath,
        url: img.url,
      })),
    ];
    const referenceImages = (
      await Promise.all(referenceSources.map((source) => buildFalInputImage(source, requestOrigin)))
    ).filter((url): url is string => Boolean(url));

    if (referenceImages.length === 0) {
      if (tokenDebited) {
        await addTokens(userId, tokenCost, 'variation_refund', { photoshootId, chipKey });
      }
      return Response.json({ error: 'Не удалось подготовить изображения для вариации' }, { status: 400 });
    }

    const selectedFormatPreset = buildSelectedFormatPreset(
      adminConfig,
      brief.sceneId,
      brief.formatPresetKey
    );
    const prompt = buildVariationPrompt(adminConfig, photoshoot.quizAnswers, selectedChip, targetImage.prompt);

    const falResponse = await fetch('https://fal.run/fal-ai/nano-banana/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${falKey}`,
      },
      body: JSON.stringify({
        prompt,
        image_urls: referenceImages,
        num_images: 1,
        aspect_ratio: selectedFormatPreset?.aspectRatio ?? adminConfig.runtimeSettings.defaultAspectRatio,
        output_format: selectedFormatPreset?.outputFormat ?? adminConfig.runtimeSettings.defaultOutputFormat,
        safety_tolerance: '4',
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text().catch(() => 'Unknown error');
      if (tokenDebited) {
        await addTokens(userId, tokenCost, 'variation_refund', { photoshootId, chipKey });
      }
      return Response.json({ error: `Ошибка fal.ai: ${errorText}` }, { status: 502 });
    }

    const result = await falResponse.json();
    const generatedUrl = result?.images?.[0]?.url ?? result?.output?.images?.[0]?.url;

    if (!generatedUrl) {
      if (tokenDebited) {
        await addTokens(userId, tokenCost, 'variation_refund', { photoshootId, chipKey });
      }
      return Response.json({ error: 'fal.ai не вернул изображение' }, { status: 502 });
    }

    const createdImage = await prisma.generatedImage.create({
      data: {
        photoshootId,
        url: generatedUrl,
        prompt,
        isPublic: true,
      },
    });

    return Response.json({
      image: {
        id: createdImage.id,
        url: createdImage.url,
        prompt: createdImage.prompt,
      },
    });
  } catch (error: any) {
    if (tokenDebited && Number.isFinite(refundUserId) && refundUserId > 0) {
      try {
        await addTokens(refundUserId, refundAmount, 'variation_refund', refundMeta);
      } catch (refundError) {
        console.error('Variation refund error:', refundError);
      }
    }
    console.error('Variation generation error:', error);
    return Response.json({ error: error?.message ?? 'Не удалось создать вариацию' }, { status: 500 });
  }
}
