import type { AndroidManifest } from 'expo/config-plugins';

import { makeConfig, makeTempDir, runMod } from './helpers';
import {
  addPreviewActivity,
  withAndroidPreviewIntent,
} from '../src/android/withAndroidPreviewIntent';

const PREVIEW_ACTIVITY = 'com.google.android.gms.tagmanager.TagManagerPreviewActivity';

function makeManifest(): AndroidManifest {
  return {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      queries: [],
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          activity: [{ $: { 'android:name': '.MainActivity' } }],
        },
      ],
    },
  };
}

function previewActivities(manifest: AndroidManifest) {
  return (manifest.manifest.application?.[0].activity ?? []).filter(
    (activity) => activity.$['android:name'] === PREVIEW_ACTIVITY
  );
}

describe('Android preview intent', () => {
  it('adds exactly one preview activity, even when applied twice', () => {
    const manifest = addPreviewActivity(
      addPreviewActivity(makeManifest(), 'com.example.app'),
      'com.example.app'
    );

    expect(previewActivities(manifest)).toEqual([
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
            data: [{ $: { 'android:scheme': 'tagmanager.c.com.example.app' } }],
          },
        ],
      },
    ]);
    expect(manifest.manifest.application?.[0].activity).toHaveLength(2);
  });

  it('throws when the Android package is missing', async () => {
    const config = withAndroidPreviewIntent(makeConfig(makeTempDir(), { android: {} }));

    await expect(runMod(config, 'android', 'manifest', {}, makeManifest())).rejects.toThrow(
      'android.package'
    );
  });
});
