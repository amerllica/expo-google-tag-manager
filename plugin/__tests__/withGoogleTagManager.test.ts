import { makeConfig } from './helpers';
import { withGoogleTagManager } from '../src/withGoogleTagManager';

describe('withGoogleTagManager', () => {
  it('throws when neither platform is set', () => {
    expect(() => withGoogleTagManager(makeConfig(), {})).toThrow(
      'set at least one of "ios" or "android"'
    );
    expect(() => withGoogleTagManager(makeConfig(), undefined)).toThrow(
      'set at least one of "ios" or "android"'
    );
  });

  it('does not touch the file system while the config is evaluated', () => {
    expect(() =>
      withGoogleTagManager(makeConfig(), {
        ios: { container: './missing/GTM-IOS1.json' },
        android: { container: './missing/GTM-AND1.json' },
        enablePreview: true,
      })
    ).not.toThrow();
  });
});
