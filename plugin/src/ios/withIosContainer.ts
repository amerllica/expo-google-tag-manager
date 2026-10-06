import {
  type ConfigPlugin,
  IOSConfig,
  type XcodeProject,
  withDangerousMod,
  withXcodeProject,
} from 'expo/config-plugins';
import path from 'path';

import { copyContainer } from '../container';
import type { ResolvedContainer } from '../types';

const CONTAINER_FOLDER = 'container';

export const withIosContainer: ConfigPlugin<ResolvedContainer> = (config, container) => {
  config = withDangerousMod(config, [
    'ios',
    (config) => {
      const { platformProjectRoot, projectName } = config.modRequest;
      copyContainer(container, path.join(platformProjectRoot, projectName!, CONTAINER_FOLDER));
      return config;
    },
  ]);

  return withXcodeProject(config, (config) => {
    addContainerFolderReference(config.modResults, config.modRequest.projectName!);
    return config;
  });
};

export function addContainerFolderReference(project: XcodeProject, projectName: string) {
  const folderPath = `${projectName}/${CONTAINER_FOLDER}`;
  if (project.hasFile(folderPath)) return project;

  IOSConfig.XcodeUtils.addResourceFileToGroup({
    filepath: folderPath,
    groupName: projectName,
    isBuildFile: true,
    project,
  });

  const fileReference = project.hasFile(folderPath);
  fileReference.lastKnownFileType = 'folder';
  delete fileReference.fileEncoding;
  delete fileReference.explicitFileType;
  return project;
}
