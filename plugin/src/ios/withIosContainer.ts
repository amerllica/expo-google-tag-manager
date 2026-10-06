import {
  type ConfigPlugin,
  type ModProps,
  withDangerousMod,
  withXcodeProject,
} from 'expo/config-plugins';
import path from 'path';

import { addFolderReference, removeFolderReference } from './xcodeFolderReference';
import { removeContainerFolder, resolveContainerFile, writeContainerFolder } from '../container';

const CONTAINER_FOLDER = 'container';

export const withIosContainer: ConfigPlugin<string | undefined> = (config, container) => {
  config = withDangerousMod(config, [
    'ios',
    (config) => {
      const { projectRoot, platformProjectRoot } = config.modRequest;
      const folder = path.join(
        platformProjectRoot,
        requireProjectName(config.modRequest),
        CONTAINER_FOLDER
      );
      if (container) {
        writeContainerFolder(folder, resolveContainerFile(projectRoot, 'ios', container));
      } else {
        removeContainerFolder(folder);
      }
      return config;
    },
  ]);

  return withXcodeProject(config, (config) => {
    const projectName = requireProjectName(config.modRequest);
    if (container) {
      addFolderReference(config.modResults, projectName, CONTAINER_FOLDER);
    } else {
      removeFolderReference(config.modResults, projectName, CONTAINER_FOLDER);
    }
    return config;
  });
};

function requireProjectName({ projectName }: ModProps) {
  if (!projectName) {
    throw new Error('expo-google-tag-manager: the iOS project name is missing from the prebuild');
  }
  return projectName;
}
