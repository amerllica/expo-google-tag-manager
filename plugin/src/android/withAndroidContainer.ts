import { type ConfigPlugin, withDangerousMod } from 'expo/config-plugins';
import path from 'path';

import { removeContainerFolder, resolveContainerFile, writeContainerFolder } from '../container';

const ASSETS_CONTAINERS_FOLDER = 'app/src/main/assets/containers';

export const withAndroidContainer: ConfigPlugin<string | undefined> = (config, container) =>
  withDangerousMod(config, [
    'android',
    (config) => {
      const { projectRoot, platformProjectRoot } = config.modRequest;
      const folder = path.join(platformProjectRoot, ASSETS_CONTAINERS_FOLDER);
      if (container) {
        writeContainerFolder(folder, resolveContainerFile(projectRoot, 'android', container));
      } else {
        removeContainerFolder(folder);
      }
      return config;
    },
  ]);
