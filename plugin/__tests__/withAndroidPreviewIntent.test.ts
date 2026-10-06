import type { AndroidManifest } from 'expo/config-plugins';

import { makeConfig, runMod } from './helpers';
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

function activityNames(manifest: AndroidManifest) {
  return (manifest.manifest.application?.[0].activity ?? []).map(
    (activity) => activity.$['android:name']
  );
}

function runManifestMod(enabled: boolean, manifest: AndroidManifest, packageName?: string) {
  const config = makeConfig({ android: { package: packageName } });
  return runMod(withAndroidPreviewIntent(config, enabled), 'android', 'manifest', {}, manifest);
}

describe('Android preview intent', () => {
  it('adds exactly one preview activity, even when applied twice', async () => {
    const once = await runManifestMod(true, makeManifest(), 'com.example.app');
    const twice = await runManifestMod(true, once, 'com.example.app');

    expect(activityNames(twice)).toEqual(['.MainActivity', PREVIEW_ACTIVITY]);
    expect(twice.manifest.application?.[0].activity?.[1]).toEqual({
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
    });
  });

  it('removes the preview activity when preview is disabled', async () => {
    const manifest = makeManifest();
    addPreviewActivity(manifest, 'com.example.app');

    expect(activityNames(await runManifestMod(false, manifest))).toEqual(['.MainActivity']);
  });

  it('needs a package name only when preview is enabled', async () => {
    await expect(runManifestMod(true, makeManifest())).rejects.toThrow('android.package');
    await expect(runManifestMod(false, makeManifest())).resolves.toBeDefined();
  });
});
