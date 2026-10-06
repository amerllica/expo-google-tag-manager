import fs from 'fs';
import path from 'path';

import { makeConfig, makeTempDir, runMod, writeJson } from './helpers';
import { withAndroidContainer } from '../src/android/withAndroidContainer';

describe('Android container', () => {
  it('copies the container into app/src/main/assets/containers/<GTM-ID>.json', async () => {
    const projectRoot = makeTempDir();
    const sourcePath = writeJson(projectRoot, 'gtm/source.json', { tags: [] });
    const platformProjectRoot = path.join(projectRoot, 'android');
    const config = withAndroidContainer(makeConfig(projectRoot), {
      sourcePath,
      containerId: 'GTM-AND1',
    });

    await runMod(config, 'android', 'dangerous', { platformProjectRoot });

    const copied = path.join(platformProjectRoot, 'app/src/main/assets/containers/GTM-AND1.json');
    expect(JSON.parse(fs.readFileSync(copied, 'utf8'))).toEqual({ tags: [] });
  });
});
