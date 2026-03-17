import { getRuntimeAdminConfig } from '@/lib/admin-config';
import {
  getEnabledFormatPresets,
  getEnabledImpressionOptions,
  getEnabledSceneDefinitions,
  getEnabledUseCaseOptions,
} from '@/lib/photoshoot-brief';
import WizardClient from './_components/wizard-client';

export default async function NewPhotoshootPage() {
  const adminConfig = await getRuntimeAdminConfig();

  return (
    <WizardClient
      defaultGenerationCount={adminConfig.defaultGenerationsPerPhotoshoot}
      useCaseOptions={getEnabledUseCaseOptions(adminConfig.useCaseOptions)}
      impressionOptions={getEnabledImpressionOptions(adminConfig.impressionOptions)}
      sceneDefinitions={getEnabledSceneDefinitions(adminConfig.sceneDefinitions)}
      formatPresets={getEnabledFormatPresets(adminConfig.formatPresets)}
    />
  );
}
