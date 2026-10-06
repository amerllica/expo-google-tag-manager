import { type ConfigPlugin, withDangerousMod } from 'expo/config-plugins';
import path from 'path';

import { copyContainer } from '../container';
import type { ResolvedContainer } from '../types';

export const withAndroidContainer: ConfigPlugin<ResolvedContainer> = (config, container) =>
  withDangerousMod(config, [
    'android',
    (config) => {
      const assetsContainersDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets/containers'
      );
      copyContainer(container, assetsContainersDir);
      return config;
    },
  ]);
