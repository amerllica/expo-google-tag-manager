import path from 'path';

import { makeConfig, makeTempDir, writeJson } from './helpers';
import { resolveContainer } from '../src/container';
import { withGoogleTagManager } from '../src/withGoogleTagManager';

describe('withGoogleTagManager props validation', () => {
  const projectRoot = makeTempDir();
  writeJson(projectRoot, 'gtm/GTM-ABC123.json', {});
  writeJson(projectRoot, 'gtm/GTM-BROKEN.json', '{ not json');
  writeJson(projectRoot, 'gtm/ios.json', {});
  writeJson(projectRoot, 'gtm/named.json', { containerId: 'GTM-NAMED1' });
  writeJson(projectRoot, 'gtm/GTM-TEXT.txt', {});

  const apply = (props: Parameters<typeof withGoogleTagManager>[1]) =>
    withGoogleTagManager(makeConfig(projectRoot), props);

  it('throws when neither platform is set', () => {
    expect(() => apply({})).toThrow('set at least one of "ios" or "android"');
    expect(() => apply(undefined)).toThrow('set at least one of "ios" or "android"');
  });

  it('throws with the resolved path when the file does not exist', () => {
    expect(() => apply({ ios: { container: './gtm/GTM-MISSING.json' } })).toThrow(
      path.join(projectRoot, 'gtm/GTM-MISSING.json')
    );
  });

  it('throws when the file is not a .json file', () => {
    expect(() => apply({ android: { container: './gtm/GTM-TEXT.txt' } })).toThrow(
      'must be a .json file'
    );
  });

  it('throws when the file is not valid JSON', () => {
    expect(() => apply({ ios: { container: './gtm/GTM-BROKEN.json' } })).toThrow(
      'is not valid JSON'
    );
  });

  it('throws when no GTM id can be found', () => {
    expect(() => apply({ ios: { container: './gtm/ios.json' } })).toThrow('is not a GTM id');
  });

  it('accepts a valid container for one platform', () => {
    expect(() => apply({ android: { container: './gtm/GTM-ABC123.json' } })).not.toThrow();
  });

  it('reads the container id from the file basename', () => {
    expect(resolveContainer(projectRoot, 'ios', { container: 'gtm/GTM-ABC123.json' })).toEqual({
      sourcePath: path.join(projectRoot, 'gtm/GTM-ABC123.json'),
      containerId: 'GTM-ABC123',
    });
  });

  it('prefers the containerId key over the file basename', () => {
    expect(resolveContainer(projectRoot, 'ios', { container: 'gtm/named.json' }).containerId).toBe(
      'GTM-NAMED1'
    );
  });
});
