import {
  AndroidConfig,
  type AndroidManifest,
  type ConfigPlugin,
  withAndroidManifest,
} from 'expo/config-plugins';

const PREVIEW_ACTIVITY = 'com.google.android.gms.tagmanager.TagManagerPreviewActivity';

export const withAndroidPreviewIntent: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    const packageName = config.android?.package;
    if (!packageName) {
      throw new Error(
        'expo-google-tag-manager: "android.package" is required when "enablePreview" is true'
      );
    }
    config.modResults = addPreviewActivity(config.modResults, packageName);
    return config;
  });

export function addPreviewActivity(manifest: AndroidManifest, packageName: string) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const activities = application.activity ?? [];
  if (activities.some((activity) => activity.$['android:name'] === PREVIEW_ACTIVITY)) {
    return manifest;
  }

  application.activity = [
    ...activities,
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
          data: [{ $: { 'android:scheme': `tagmanager.c.${packageName}` } }],
        },
      ],
    },
  ];
  return manifest;
}
