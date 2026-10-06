import { makeConfig, makeTempDir, runMod } from './helpers';
import { addPreviewUrlScheme, withIosPreviewScheme } from '../src/ios/withIosPreviewScheme';

describe('iOS preview scheme', () => {
  const scheme = 'tagmanager.c.com.example.app';

  it('adds the scheme once, even when applied twice', () => {
    const once = addPreviewUrlScheme({}, 'com.example.app');
    const twice = addPreviewUrlScheme(once, 'com.example.app');

    expect(twice.CFBundleURLTypes).toEqual([{ CFBundleURLSchemes: [scheme] }]);
  });

  it('keeps existing URL types', () => {
    const infoPlist = addPreviewUrlScheme(
      { CFBundleURLTypes: [{ CFBundleURLSchemes: ['myapp'] }] },
      'com.example.app'
    );

    expect(infoPlist.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: ['myapp'] },
      { CFBundleURLSchemes: [scheme] },
    ]);
  });

  it('throws when the bundle identifier is missing', async () => {
    const config = withIosPreviewScheme(makeConfig(makeTempDir(), { ios: {} }));

    await expect(runMod(config, 'ios', 'infoPlist', {})).rejects.toThrow('ios.bundleIdentifier');
  });
});
