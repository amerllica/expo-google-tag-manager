import fs from 'fs';
import path from 'path';

const CONTAINER_FILE_PATTERN = /^GTM-[A-Z0-9]+\.json$/;

export function resolveContainerFile(projectRoot: string, platform: string, container: string) {
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

  return sourcePath;
}

export function writeContainerFolder(folder: string, containerFile: string) {
  removeContainerFolder(folder);
  fs.mkdirSync(folder, { recursive: true });
  fs.copyFileSync(containerFile, path.join(folder, path.basename(containerFile)));
}

export function removeContainerFolder(folder: string) {
  fs.rmSync(folder, { recursive: true, force: true });
}
