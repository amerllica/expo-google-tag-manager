import { type ConfigPlugin } from 'expo/config-plugins';

import { withAndroidContainer } from './android/withAndroidContainer';
import { withAndroidPreviewIntent } from './android/withAndroidPreviewIntent';
import { resolveContainer } from './container';
import { withIosContainer } from './ios/withIosContainer';
import { withIosPreviewScheme } from './ios/withIosPreviewScheme';
import type { GoogleTagManagerPluginProps } from './types';

export const withGoogleTagManager: ConfigPlugin<GoogleTagManagerPluginProps | void> = (
  config,
  props
) => {
  const { ios, android, enablePreview = false } = props ?? {};
  if (!ios && !android) {
    throw new Error(
      'expo-google-tag-manager: set at least one of "ios" or "android" with a "container" path'
    );
  }

  const projectRoot = config._internal?.projectRoot ?? process.cwd();

  if (ios) {
    config = withIosContainer(config, resolveContainer(projectRoot, 'ios', ios));
    if (enablePreview) config = withIosPreviewScheme(config);
  }

  if (android) {
    config = withAndroidContainer(config, resolveContainer(projectRoot, 'android', android));
    if (enablePreview) config = withAndroidPreviewIntent(config);
  }

  return config;
};
