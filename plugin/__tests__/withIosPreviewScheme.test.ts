import type { InfoPlist } from 'expo/config-plugins';

import { makeConfig, runMod } from './helpers';
import { withIosPreviewScheme } from '../src/ios/withIosPreviewScheme';

function runInfoPlistMod(enabled: boolean, infoPlist: InfoPlist, bundleIdentifier?: string) {
  const config = makeConfig({ ios: { bundleIdentifier } });
  return runMod(withIosPreviewScheme(config, enabled), 'ios', 'infoPlist', {}, infoPlist);
}

describe('iOS preview scheme', () => {
  it('adds the scheme once, even when applied twice', async () => {
    const once = await runInfoPlistMod(true, {}, 'com.example.app');
    const twice = await runInfoPlistMod(true, once, 'com.example.app');

    expect(twice.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: ['tagmanager.c.com.example.app'] },
    ]);
  });

  it('keeps other URL types and replaces a scheme left from an old bundle identifier', async () => {
    const infoPlist = await runInfoPlistMod(
      true,
      {
        CFBundleURLTypes: [
          { CFBundleURLSchemes: ['myapp', 'tagmanager.c.com.example.old'] },
          { CFBundleURLSchemes: ['tagmanager.c.com.example.old'] },
        ],
      },
      'com.example.app'
    );

    expect(infoPlist.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: ['myapp'] },
      { CFBundleURLSchemes: ['tagmanager.c.com.example.app'] },
    ]);
  });

  it('removes the scheme when preview is disabled', async () => {
    const infoPlist = await runInfoPlistMod(false, {
      CFBundleURLTypes: [{ CFBundleURLSchemes: ['tagmanager.c.com.example.app'] }],
    });

    expect(infoPlist.CFBundleURLTypes).toBeUndefined();
  });

  it('needs a bundle identifier only when preview is enabled', async () => {
    await expect(runInfoPlistMod(true, {})).rejects.toThrow('ios.bundleIdentifier');
    await expect(runInfoPlistMod(false, {})).resolves.toEqual({});
  });
});
