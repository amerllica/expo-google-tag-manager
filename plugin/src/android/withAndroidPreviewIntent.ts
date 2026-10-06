import {
  AndroidConfig,
  type AndroidManifest,
  type ConfigPlugin,
  withAndroidManifest,
} from 'expo/config-plugins';

import { missingAppIdError, previewScheme } from '../preview';

const PREVIEW_ACTIVITY = 'com.google.android.gms.tagmanager.TagManagerPreviewActivity';

export const withAndroidPreviewIntent: ConfigPlugin<boolean> = (config, enabled) =>
  withAndroidManifest(config, (config) => {
    removePreviewActivity(config.modResults);
    if (enabled) {
      const packageName = config.android?.package;
      if (!packageName) throw missingAppIdError('android.package');
      addPreviewActivity(config.modResults, packageName);
    }
    return config;
  });

export function removePreviewActivity(manifest: AndroidManifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.activity = application.activity?.filter(
    (activity) => activity.$['android:name'] !== PREVIEW_ACTIVITY
  );
}

export function addPreviewActivity(manifest: AndroidManifest, packageName: string) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.activity = [
    ...(application.activity ?? []),
    {
      $: {
        'android:name': PREVIEW_ACTIVITY,
        'android:exported': 'true',
        'android:noHistory': 'true',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          category: [
            { $: { 'android:name': 'android.intent.category.DEFAULT' } },
            { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
          ],
          data: [{ $: { 'android:scheme': previewScheme(packageName) } }],
        },
      ],
    },
  ];
}
