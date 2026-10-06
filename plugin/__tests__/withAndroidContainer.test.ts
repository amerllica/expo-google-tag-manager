import path from 'path';

import { listFiles, makeConfig, makeTempDir, runMod, writeFile } from './helpers';
import { withAndroidContainer } from '../src/android/withAndroidContainer';

function containersFolder(projectRoot: string) {
  return path.join(projectRoot, 'android/app/src/main/assets/containers');
}

function runDangerousMod(projectRoot: string, container: string | undefined) {
  return runMod(
    withAndroidContainer(makeConfig(), container),
    'android',
    'dangerous',
    {
      projectRoot,
      platformProjectRoot: path.join(projectRoot, 'android'),
    },
    {}
  );
}

describe('Android container files', () => {
  it('writes the container into app/src/main/assets/containers and drops stale ones', async () => {
    const projectRoot = makeTempDir();
    writeFile(containersFolder(projectRoot), 'GTM-OLD.json', {});
    writeFile(projectRoot, 'gtm/GTM-AND1.json', { tags: [] });

    await runDangerousMod(projectRoot, './gtm/GTM-AND1.json');

    expect(listFiles(containersFolder(projectRoot))).toEqual(['GTM-AND1.json']);
  });

  it('removes the containers folder when Android is not configured', async () => {
    const projectRoot = makeTempDir();
    writeFile(containersFolder(projectRoot), 'GTM-OLD.json', {});

    await runDangerousMod(projectRoot, undefined);

    expect(listFiles(containersFolder(projectRoot))).toEqual([]);
  });

  it('validates the container file at prebuild time', async () => {
    const projectRoot = makeTempDir();
    writeFile(projectRoot, 'gtm/GTM-BROKEN.json', '{ not json');

    await expect(runDangerousMod(projectRoot, './gtm/GTM-BROKEN.json')).rejects.toThrow(
      'android container is not valid JSON'
    );
  });
});
