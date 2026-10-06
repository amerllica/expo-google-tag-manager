import type { ExpoConfig } from 'expo/config';
import type { ExportedConfig } from 'expo/config-plugins';
import fs from 'fs';
import os from 'os';
import path from 'path';

export function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'expo-gtm-'));
}

export function writeJson(dir: string, fileName: string, contents: unknown) {
  const filePath = path.join(dir, fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, typeof contents === 'string' ? contents : JSON.stringify(contents));
  return filePath;
}

export function makeConfig(projectRoot: string, overrides: Partial<ExpoConfig> = {}) {
  return {
    name: 'example',
    slug: 'example',
    ios: { bundleIdentifier: 'com.example.app' },
    android: { package: 'com.example.app' },
    ...overrides,
    _internal: { projectRoot },
  } as ExpoConfig;
}

type ModFunction = (config: object) => Promise<{ modResults: unknown }>;

export async function runMod(
  config: ExpoConfig,
  platform: 'ios' | 'android',
  mod: string,
  modRequest: object,
  modResults: unknown = {}
) {
  const action = (
    (config as ExportedConfig).mods?.[platform] as Record<string, ModFunction> | undefined
  )?.[mod];
  if (!action) throw new Error(`mod ${platform}.${mod} was not registered`);
  return action({ ...config, modRequest: { platform, ...modRequest }, modResults });
}

export function makeIosProjectRoot(projectName: string) {
  const projectRoot = makeTempDir();
  const xcodeprojDir = path.join(projectRoot, 'ios', `${projectName}.xcodeproj`);
  fs.mkdirSync(xcodeprojDir, { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, 'fixtures/project.pbxproj'),
    path.join(xcodeprojDir, 'project.pbxproj')
  );
  return projectRoot;
}
