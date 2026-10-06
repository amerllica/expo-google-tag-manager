import fs from 'fs';
import path from 'path';

import type { PlatformContainer, ResolvedContainer } from './types';

const CONTAINER_FILE_PATTERN = /^GTM-[A-Z0-9]+\.json$/;

export function resolveContainer(
  projectRoot: string,
  platform: string,
  { container }: PlatformContainer
): ResolvedContainer {
  const sourcePath = path.resolve(projectRoot, container);
  const fail = (reason: string): never => {
    throw new Error(`expo-google-tag-manager: ${platform} container ${reason}: ${sourcePath}`);
  };

  if (!CONTAINER_FILE_PATTERN.test(path.basename(sourcePath))) {
    fail('must be named after its GTM id, like GTM-XXXX.json');
  }
  if (!fs.existsSync(sourcePath)) fail('file does not exist');

  try {
    JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  } catch {
    fail('is not valid JSON');
  }

  return { sourcePath, containerId: path.basename(sourcePath, '.json') };
}

export function copyContainer(
  { sourcePath, containerId }: ResolvedContainer,
  destinationDir: string
) {
  fs.mkdirSync(destinationDir, { recursive: true });
  const destinationPath = path.join(destinationDir, `${containerId}.json`);
  fs.copyFileSync(sourcePath, destinationPath);
  return destinationPath;
}
