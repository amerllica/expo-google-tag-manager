import type { XcodeProject } from 'expo/config-plugins';
import path from 'path';

import {
  IOS_PROJECT_NAME,
  listFiles,
  loadXcodeProject,
  makeConfig,
  makeIosProjectRoot,
  runMod,
  writeFile,
} from './helpers';
import { withIosContainer } from '../src/ios/withIosContainer';

function containerFolder(projectRoot: string) {
  return path.join(projectRoot, 'ios', IOS_PROJECT_NAME, 'container');
}

function runDangerousMod(projectRoot: string, container: string | undefined) {
  return runMod(
    withIosContainer(makeConfig(), container),
    'ios',
    'dangerous',
    {
      projectRoot,
      projectName: IOS_PROJECT_NAME,
      platformProjectRoot: path.join(projectRoot, 'ios'),
    },
    {}
  );
}

function runXcodeMod(projectRoot: string, project: XcodeProject, container: string | undefined) {
  return runMod(
    withIosContainer(makeConfig(), container),
    'ios',
    'xcodeproj',
    { projectRoot, projectName: IOS_PROJECT_NAME },
    project
  );
}

function containerReferences(project: XcodeProject) {
  const contents: string = project.writeSync();
  return {
    folderReferences:
      contents.match(
        /\/\* container \*\/ = \{isa = PBXFileReference; lastKnownFileType = folder; name = container; path = expogoogletagmanagerexample\/container; sourceTree = "<group>"; \};/g
      )?.length ?? 0,
    buildFiles:
      contents.match(/\/\* container in Resources \*\/ = \{isa = PBXBuildFile;/g)?.length ?? 0,
    groupChildren: contents.match(/\t\t\t\t\w+ \/\* container \*\/,/g)?.length ?? 0,
    resources: contents.match(/\t\t\t\t\w+ \/\* container in Resources \*\/,/g)?.length ?? 0,
  };
}

describe('iOS container files', () => {
  it('writes the container into ios/<project>/container and drops stale ones', async () => {
    const projectRoot = makeIosProjectRoot();
    writeFile(containerFolder(projectRoot), 'GTM-OLD.json', {});
    writeFile(projectRoot, 'gtm/GTM-IOS1.json', { tags: [] });

    await runDangerousMod(projectRoot, './gtm/GTM-IOS1.json');

    expect(listFiles(containerFolder(projectRoot))).toEqual(['GTM-IOS1.json']);
  });

  it('removes the container folder when iOS is not configured', async () => {
    const projectRoot = makeIosProjectRoot();
    writeFile(containerFolder(projectRoot), 'GTM-OLD.json', {});

    await runDangerousMod(projectRoot, undefined);

    expect(listFiles(containerFolder(projectRoot))).toEqual([]);
  });

  it('validates the container file at prebuild time', async () => {
    const projectRoot = makeIosProjectRoot();

    await expect(runDangerousMod(projectRoot, './gtm/GTM-MISSING.json')).rejects.toThrow(
      'ios container file does not exist'
    );
  });
});

describe('iOS container folder reference', () => {
  it('adds one folder reference to the app group and Resources phase, even when applied twice', async () => {
    const projectRoot = makeIosProjectRoot();
    const project = await runXcodeMod(
      projectRoot,
      await runXcodeMod(projectRoot, loadXcodeProject(projectRoot), './gtm/GTM-IOS1.json'),
      './gtm/GTM-IOS1.json'
    );

    expect(containerReferences(project)).toEqual({
      folderReferences: 1,
      buildFiles: 1,
      groupChildren: 1,
      resources: 1,
    });
  });

  it('removes the folder reference when iOS is not configured', async () => {
    const projectRoot = makeIosProjectRoot();
    const withContainer = await runXcodeMod(
      projectRoot,
      loadXcodeProject(projectRoot),
      './gtm/GTM-IOS1.json'
    );
    const project = await runXcodeMod(projectRoot, withContainer, undefined);

    expect(containerReferences(project)).toEqual({
      folderReferences: 0,
      buildFiles: 0,
      groupChildren: 0,
      resources: 0,
    });
    expect(project.writeSync()).toBe(loadXcodeProject(projectRoot).writeSync());
  });
});
