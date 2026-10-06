import type { ExpoConfig } from 'expo/config';
import { IOSConfig, type ExportedConfig, type XcodeProject } from 'expo/config-plugins';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const IOS_PROJECT_NAME = 'expogoogletagmanagerexample';

export function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'expo-gtm-'));
}

export function writeFile(dir: string, fileName: string, contents: unknown) {
  const filePath = path.join(dir, fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, typeof contents === 'string' ? contents : JSON.stringify(contents));
  return filePath;
}

export function listFiles(dir: string) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
}

export function makeConfig(overrides: Partial<ExpoConfig> = {}) {
  return {
    name: 'example',
    slug: 'example',
    ios: { bundleIdentifier: 'com.example.app' },
    android: { package: 'com.example.app' },
    ...overrides,
  } as ExpoConfig;
}

type ModFunction = (config: object) => Promise<{ modResults: unknown }>;

export async function runMod<Results>(
  config: ExpoConfig,
  platform: 'ios' | 'android',
  mod: string,
  modRequest: object,
  modResults: Results
) {
  const action = (
    (config as ExportedConfig).mods?.[platform] as Record<string, ModFunction> | undefined
  )?.[mod];
  if (!action) throw new Error(`mod ${platform}.${mod} was not registered`);
  const result = await action({ ...config, modRequest: { platform, ...modRequest }, modResults });
  return result.modResults as Results;
}

export function makeIosProjectRoot() {
  const projectRoot = makeTempDir();
  const xcodeprojDir = path.join(projectRoot, 'ios', `${IOS_PROJECT_NAME}.xcodeproj`);
  fs.mkdirSync(xcodeprojDir, { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, 'fixtures/project.pbxproj'),
    path.join(xcodeprojDir, 'project.pbxproj')
  );
  return projectRoot;
}

export function loadXcodeProject(projectRoot: string): XcodeProject {
  return IOSConfig.XcodeUtils.getPbxproj(projectRoot);
}
