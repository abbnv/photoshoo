import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getRuntimeAdminConfig } from '@/lib/admin-config';
import {
  getEnabledFormatPresets,
  getEnabledImpressionOptions,
  getEnabledSceneDefinitions,
  getEnabledUseCaseOptions,
} from '@/lib/photoshoot-brief';
import DetailClient from './_components/detail-client';

export default async function PhotoshootDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  const userId = Number((session.user as any)?.id);
  const photoshootId = Number(params?.id);
  if (!Number.isFinite(photoshootId)) {
    redirect('/photoshoots');
  }

  const photoshoot = await prisma.photoshoot.findFirst({
    where: { id: photoshootId, userId },
    select: { id: true, status: true },
  });

  if (!photoshoot) {
    redirect('/photoshoots');
  }

  if (photoshoot.status !== 'completed') {
    redirect(`/photoshoots/${photoshoot.id}/edit`);
  }

  const adminConfig = await getRuntimeAdminConfig();

  return (
    <DetailClient
      id={params?.id ?? ''}
      useCaseOptions={getEnabledUseCaseOptions(adminConfig.useCaseOptions)}
      impressionOptions={getEnabledImpressionOptions(adminConfig.impressionOptions)}
      formatPresets={getEnabledFormatPresets(adminConfig.formatPresets)}
      sceneDefinitions={getEnabledSceneDefinitions(adminConfig.sceneDefinitions)}
      variationChips={adminConfig.variationChips.filter((chip) => chip.enabled)}
    />
  );
}
