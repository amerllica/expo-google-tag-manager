import fs from 'fs';
import path from 'path';

import type { PlatformContainer, ResolvedContainer } from './types';

const CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

export function resolveContainer(
  projectRoot: string,
  platform: string,
  { container }: PlatformContainer
): ResolvedContainer {
  const sourcePath = path.resolve(projectRoot, container);
  const fail = (reason: string): never => {
    throw new Error(`expo-google-tag-manager: ${platform} container ${reason}: ${sourcePath}`);
  };

  if (path.extname(sourcePath) !== '.json') fail('must be a .json file');
  if (!fs.existsSync(sourcePath)) fail('file does not exist');

  let contents: unknown;
  try {
    contents = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  } catch {
    fail('is not valid JSON');
  }

  const containerId = readContainerId(contents) ?? path.basename(sourcePath, '.json');
  if (!CONTAINER_ID_PATTERN.test(containerId)) {
    fail(
      `id "${containerId}" is not a GTM id; add a "containerId" key or name the file GTM-XXXX.json`
    );
  }

  return { sourcePath, containerId };
}

function readContainerId(contents: unknown): string | undefined {
  if (typeof contents !== 'object' || contents === null || !('containerId' in contents)) {
    return undefined;
  }
  return typeof contents.containerId === 'string' ? contents.containerId : undefined;
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
