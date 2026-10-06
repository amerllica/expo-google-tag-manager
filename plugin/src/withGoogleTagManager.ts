import { type ConfigPlugin } from 'expo/config-plugins';

import { withAndroidContainer } from './android/withAndroidContainer';
import { withAndroidPreviewIntent } from './android/withAndroidPreviewIntent';
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

  config = withIosContainer(config, ios?.container);
  config = withIosPreviewScheme(config, enablePreview && !!ios);
  config = withAndroidContainer(config, android?.container);
  config = withAndroidPreviewIntent(config, enablePreview && !!android);
  return config;
};
