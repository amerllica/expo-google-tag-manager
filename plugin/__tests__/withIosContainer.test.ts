import { IOSConfig, type XcodeProject } from 'expo/config-plugins';
import fs from 'fs';
import path from 'path';

import { makeConfig, makeIosProjectRoot, makeTempDir, runMod, writeJson } from './helpers';
import { addContainerFolderReference, withIosContainer } from '../src/ios/withIosContainer';

const PROJECT_NAME = 'expogoogletagmanagerexample';

function loadFixtureProject() {
  return IOSConfig.XcodeUtils.getPbxproj(makeIosProjectRoot(PROJECT_NAME));
}

function countContainerReferences(project: XcodeProject) {
  const contents = project.writeSync();
  return {
    fileReferences: contents.match(/\/\* container \*\/ = \{isa = PBXFileReference/g)?.length ?? 0,
    resources: contents.match(/\/\* container in Resources \*\/,/g)?.length ?? 0,
    folderType: /container \*\/ = \{isa = PBXFileReference;[^}]*lastKnownFileType = folder;/.test(
      contents
    ),
    undefinedValues: contents.includes('undefined'),
  };
}

describe('iOS container', () => {
  it('copies the container into <project>/container/<GTM-ID>.json', async () => {
    const projectRoot = makeTempDir();
    const sourcePath = writeJson(projectRoot, 'gtm/source.json', { tags: [] });
    const platformProjectRoot = path.join(projectRoot, 'ios');
    const config = withIosContainer(makeConfig(projectRoot), {
      sourcePath,
      containerId: 'GTM-IOS1',
    });

    await runMod(config, 'ios', 'dangerous', {
      platformProjectRoot,
      projectName: PROJECT_NAME,
    });

    const copied = path.join(platformProjectRoot, PROJECT_NAME, 'container/GTM-IOS1.json');
    expect(JSON.parse(fs.readFileSync(copied, 'utf8'))).toEqual({ tags: [] });
  });

  it('adds one folder reference to the Resources build phase, even when applied twice', () => {
    const project = loadFixtureProject();

    addContainerFolderReference(project, PROJECT_NAME);
    addContainerFolderReference(project, PROJECT_NAME);

    expect(countContainerReferences(project)).toEqual({
      fileReferences: 1,
      resources: 1,
      folderType: true,
      undefinedValues: false,
    });
  });
});
