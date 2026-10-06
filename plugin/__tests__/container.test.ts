import path from 'path';

import { listFiles, makeTempDir, writeFile } from './helpers';
import { resolveContainerFile, writeContainerFolder } from '../src/container';

describe('resolveContainerFile', () => {
  const projectRoot = makeTempDir();
  writeFile(projectRoot, 'gtm/GTM-ABC123.json', {});
  writeFile(projectRoot, 'gtm/GTM-BROKEN.json', '{ not json');
  writeFile(projectRoot, 'gtm/ios.json', {});
  writeFile(projectRoot, 'gtm/GTM-TEXT.txt', {});

  it('returns the absolute path of a valid container', () => {
    expect(resolveContainerFile(projectRoot, 'ios', './gtm/GTM-ABC123.json')).toBe(
      path.join(projectRoot, 'gtm/GTM-ABC123.json')
    );
  });

  it.each([
    ['./gtm/ios.json', 'must be named after its GTM id, like GTM-XXXX.json'],
    ['./gtm/GTM-TEXT.txt', 'must be named after its GTM id, like GTM-XXXX.json'],
    ['./gtm/GTM-MISSING.json', 'file does not exist'],
    ['./gtm/GTM-BROKEN.json', 'is not valid JSON'],
  ])('rejects %s', (container, reason) => {
    expect(() => resolveContainerFile(projectRoot, 'android', container)).toThrow(
      `android container ${reason}: ${path.resolve(projectRoot, container)}`
    );
  });
});

describe('writeContainerFolder', () => {
  it('replaces every file already in the folder', () => {
    const root = makeTempDir();
    const folder = path.join(root, 'containers');
    writeFile(folder, 'GTM-OLD.json', {});
    const containerFile = writeFile(root, 'gtm/GTM-NEW.json', { tags: [] });

    writeContainerFolder(folder, containerFile);

    expect(listFiles(folder)).toEqual(['GTM-NEW.json']);
  });
});
