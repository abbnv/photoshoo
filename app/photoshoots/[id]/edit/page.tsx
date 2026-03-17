import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import {
  getEnabledFormatPresets,
  getEnabledImpressionOptions,
  getEnabledSceneDefinitions,
  getEnabledUseCaseOptions,
  normalizeCreativeBrief,
} from '@/lib/photoshoot-brief';
import WizardClient from '../../new/_components/wizard-client';

export default async function EditPhotoshootPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  const userId = Number((session.user as any)?.id);
  const photoshootId = Number(params?.id);
  if (!Number.isFinite(photoshootId)) {
    redirect('/photoshoots');
  }

  const [adminConfig, photoshoot] = await Promise.all([
    getRuntimeAdminConfig(),
    prisma.photoshoot.findFirst({
      where: { id: photoshootId, userId },
      include: {
        sourceImages: { orderBy: { fileOrder: 'asc' } },
      },
    }),
  ]);

  if (!photoshoot) {
    redirect('/photoshoots');
  }

  if (photoshoot.status === 'completed') {
    redirect(`/photoshoots/${photoshoot.id}`);
  }

  const sourceImageUrls = await Promise.all(
    (photoshoot.sourceImages ?? []).map(async (img) => {
      if (img.cloudStoragePath) {
        try {
          return await getFileUrl(img.cloudStoragePath, img.isPublic);
        } catch {
          return img.url;
        }
      }
      return img.url;
    })
  );

  const brief = normalizeCreativeBrief(photoshoot.quizAnswers);
  const initialStep: 1 | 2 | 3 =
    photoshoot.status === 'processing'
      ? 3
      : sourceImageUrls.length > 0
        ? 2
        : 1;

  return (
    <WizardClient
      defaultGenerationCount={adminConfig.defaultGenerationsPerPhotoshoot}
      useCaseOptions={getEnabledUseCaseOptions(adminConfig.useCaseOptions)}
      impressionOptions={getEnabledImpressionOptions(adminConfig.impressionOptions)}
      sceneDefinitions={getEnabledSceneDefinitions(adminConfig.sceneDefinitions)}
      formatPresets={getEnabledFormatPresets(adminConfig.formatPresets)}
      initialPhotoshootId={photoshoot.id}
      initialSourceImageUrls={sourceImageUrls}
      initialQuizAnswers={brief}
      initialStep={initialStep}
      initialCanvasStatus={photoshoot.status === 'processing' ? 'processing' : 'idle'}
    />
  );
}
