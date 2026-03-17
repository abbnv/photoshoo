export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import { normalizeCreativeBrief } from '@/lib/photoshoot-brief';
import { buildFalInputImage, buildPrompt, buildSelectedFormatPreset } from '@/lib/photoshoot-generation';
import { addTokens, consumeTokensOrThrow, InsufficientTokensError } from '@/lib/token-balance';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Не авторизован' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const userId = Number((session.user as any)?.id);
    const photoshootId = Number(params?.id);

    const ps = await prisma.photoshoot.findFirst({
      where: { id: photoshootId, userId },
      include: {
        sourceImages: { orderBy: { fileOrder: 'asc' } },
      },
    });
    if (!ps) {
      return new Response(JSON.stringify({ error: 'Не найдено' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const quizAnswers = body?.quizAnswers ?? ps?.quizAnswers ?? {};
    const adminConfig = await getRuntimeAdminConfig();
    const tokenCost = Math.max(1, Math.round(adminConfig.billingConfig.tokenCostPerGeneration ?? 1));
    const falKey = adminConfig.falApiKey;
    if (!falKey || falKey === 'placeholder_fal_api_key') {
      return new Response(JSON.stringify({ error: 'FAL_KEY не настроен. Добавьте ключ fal.ai API.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let tokenDebited = false;
    try {
      await consumeTokensOrThrow(userId, tokenCost, 'generation', { photoshootId });
      tokenDebited = true;
    } catch (error) {
      if (error instanceof InsufficientTokensError) {
        return new Response(
          JSON.stringify({
            error: `Недостаточно токенов. Нужно ${tokenCost}, доступно ${error.balance}.`,
            code: 'INSUFFICIENT_TOKENS',
            balance: error.balance,
            required: tokenCost,
          }),
          {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      throw error;
    }

    const numImages = Math.max(1, Math.min(100, adminConfig.defaultGenerationsPerPhotoshoot ?? 12));
    const brief = normalizeCreativeBrief(quizAnswers);
    const selectedFormatPreset = buildSelectedFormatPreset(
      adminConfig,
      brief.sceneId,
      brief.formatPresetKey
    );
    const aspectRatio = selectedFormatPreset?.aspectRatio ?? adminConfig.runtimeSettings.defaultAspectRatio;
    const outputFormat = selectedFormatPreset?.outputFormat ?? adminConfig.runtimeSettings.defaultOutputFormat;

    // Get source image URLs for reference
    if ((ps.sourceImages?.length ?? 0) === 0) {
      return new Response(JSON.stringify({ error: 'Нет загруженных фотографий' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update status to processing
    await prisma.photoshoot.update({
      where: { id: photoshootId },
      data: { status: 'processing' },
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ status: 'processing', progress: 5, message: 'Подготовка промптов...', completedCount: 0, totalCount: numImages });

          // Use fal.ai nano-banana/edit API with reference images
          const requestOrigin = new URL(request.url).origin;
          send({ status: 'processing', progress: 8, message: 'Подготовка референсов...', completedCount: 0, totalCount: numImages });
          const sourceImageUrls = (
            await Promise.all(
              (ps.sourceImages ?? []).map((img) =>
                buildFalInputImage({ cloudStoragePath: img?.cloudStoragePath, url: img?.url }, requestOrigin)
              )
            )
          ).filter((url): url is string => !!url);

          if (sourceImageUrls.length === 0) {
            throw new Error('Не удалось подготовить референсы для генерации.');
          }

          const allImages: string[] = [];
          const batchSize = 2; // nano-banana generates 1 image per request, send 2 parallel
          const batches = Math.ceil(numImages / batchSize);

          for (let batch = 0; batch < batches; batch++) {
            const currentBatchSize = Math.min(batchSize, numImages - allImages.length);
            const progressPct = Math.round(10 + (batch / batches) * 80);
            send({
              status: 'processing',
              progress: progressPct,
              message: `Генерация изображений... (${allImages.length}/${numImages})`,
              completedCount: allImages.length,
              totalCount: numImages,
            });

            // Run batch in parallel
            const batchPromises = [];
            for (let i = 0; i < currentBatchSize; i++) {
              const variationIndex = batch * batchSize + i;
              const prompt = buildPrompt(adminConfig, quizAnswers, variationIndex);

              batchPromises.push(
                (async () => {
                  try {
                    // Call fal.ai nano-banana/edit with reference images
                    const response = await fetch('https://fal.run/fal-ai/nano-banana/edit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Key ${falKey}`,
                      },
                      body: JSON.stringify({
                        prompt,
                        image_urls: sourceImageUrls,
                        num_images: 1,
                        aspect_ratio: aspectRatio,
                        output_format: outputFormat,
                        safety_tolerance: '4',
                      }),
                    });

                    if (!response.ok) {
                      const errText = await response.text().catch(() => 'Unknown error');
                      console.error('fal.ai API error:', response.status, errText);
                      return null;
                    }

                    const result = await response.json();
                    // fal.ai returns { images: [{ url, ... }], ... }
                    const images = result?.images ?? result?.output?.images ?? [];
                    if (images.length > 0) {
                      return images[0]?.url ?? null;
                    }
                    return null;
                  } catch (err: any) {
                    console.error('fal.ai batch item error:', err?.message);
                    return null;
                  }
                })()
              );
            }

            const results = await Promise.all(batchPromises);
            for (const url of results) {
              if (url) allImages.push(url);
              if (url) {
                const imageIndex = allImages.length - 1;
                send({
                  status: 'image_generated',
                  progress: Math.round(10 + (allImages.length / numImages) * 80),
                  message: `Готово изображений: ${allImages.length}/${numImages}`,
                  imageUrl: url,
                  imageIndex,
                  completedCount: allImages.length,
                  totalCount: numImages,
                });
              }
            }
          }

          if (allImages.length === 0) {
            throw new Error('Не удалось сгенерировать изображения. Проверьте ключ API и попробуйте снова.');
          }

          send({ status: 'processing', progress: 90, message: 'Сохранение изображений...', completedCount: allImages.length, totalCount: numImages });

          // Save generated images to DB
          const prompt = buildPrompt(adminConfig, quizAnswers);
          for (const url of allImages) {
            await prisma.generatedImage.create({
              data: {
                photoshootId,
                url,
                prompt,
                isPublic: true,
              },
            });
          }

          // Update photoshoot status
          await prisma.photoshoot.update({
            where: { id: photoshootId },
            data: { status: 'completed' },
          });

          send({
            status: 'completed',
            progress: 100,
            message: 'Генерация завершена!',
            images: allImages,
            completedCount: allImages.length,
            totalCount: numImages,
          });
          tokenDebited = false;

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err: any) {
          console.error('Generation stream error:', err);
          if (tokenDebited) {
            try {
              await addTokens(userId, tokenCost, 'generation_refund', { photoshootId });
            } catch (refundError) {
              console.error('Generation refund error:', refundError);
            }
          }
          try {
            await prisma.photoshoot.update({
              where: { id: photoshootId },
              data: { status: 'failed' },
            });
          } catch {}
          send({ status: 'error', message: err?.message ?? 'Ошибка генерации' });
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return new Response(JSON.stringify({ error: error?.message ?? 'Ошибка генерации' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
