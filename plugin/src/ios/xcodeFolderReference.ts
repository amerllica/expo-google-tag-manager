import { IOSConfig, type XcodeProject } from 'expo/config-plugins';

type CommentedUuid = { value: string; comment: string };

type FileReference = {
  isa: 'PBXFileReference';
  lastKnownFileType: string;
  name: string;
  path: string;
  sourceTree: string;
};

type BuildFile = { isa: 'PBXBuildFile'; fileRef: string; fileRef_comment: string };

type Section<Entry> = Record<string, Entry | string>;

const GROUP_SOURCE_TREE = '"<group>"';

export function addFolderReference(project: XcodeProject, projectName: string, folder: string) {
  const folderPath = `${projectName}/${folder}`;
  if (findFileReferenceUuid(project, folderPath)) return;

  const fileReferenceUuid: string = project.generateUuid();
  const buildFileUuid: string = project.generateUuid();
  const buildFileComment = `${folder} in Resources`;

  Object.assign(fileReferences(project), {
    [fileReferenceUuid]: {
      isa: 'PBXFileReference',
      lastKnownFileType: 'folder',
      name: folder,
      path: folderPath,
      sourceTree: GROUP_SOURCE_TREE,
    } satisfies FileReference,
    [`${fileReferenceUuid}_comment`]: folder,
  });
  Object.assign(buildFiles(project), {
    [buildFileUuid]: {
      isa: 'PBXBuildFile',
      fileRef: fileReferenceUuid,
      fileRef_comment: folder,
    } satisfies BuildFile,
    [`${buildFileUuid}_comment`]: buildFileComment,
  });
  projectGroup(project, projectName).children.push({ value: fileReferenceUuid, comment: folder });
  resourcesPhase(project, projectName).files.push({
    value: buildFileUuid,
    comment: buildFileComment,
  });
}

export function removeFolderReference(project: XcodeProject, projectName: string, folder: string) {
  const fileReferenceUuid = findFileReferenceUuid(project, `${projectName}/${folder}`);
  if (!fileReferenceUuid) return;

  const buildFileSection = buildFiles(project);
  const buildFileUuids = Object.keys(buildFileSection).filter((uuid) => {
    const entry = buildFileSection[uuid];
    return typeof entry === 'object' && entry.fileRef === fileReferenceUuid;
  });

  for (const uuid of buildFileUuids) {
    delete buildFileSection[uuid];
    delete buildFileSection[`${uuid}_comment`];
  }
  delete fileReferences(project)[fileReferenceUuid];
  delete fileReferences(project)[`${fileReferenceUuid}_comment`];

  const group = projectGroup(project, projectName);
  group.children = group.children.filter(({ value }) => value !== fileReferenceUuid);
  const phase = resourcesPhase(project, projectName);
  phase.files = phase.files.filter(({ value }) => !buildFileUuids.includes(value));
}

function findFileReferenceUuid(project: XcodeProject, folderPath: string) {
  const section = fileReferences(project);
  return Object.keys(section).find((uuid) => {
    const entry = section[uuid];
    return typeof entry === 'object' && IOSConfig.XcodeUtils.unquote(entry.path) === folderPath;
  });
}

function fileReferences(project: XcodeProject): Section<FileReference> {
  return project.pbxFileReferenceSection();
}

function buildFiles(project: XcodeProject): Section<BuildFile> {
  return project.pbxBuildFileSection();
}

function projectGroup(project: XcodeProject, projectName: string): { children: CommentedUuid[] } {
  const group = project.pbxGroupByName(projectName);
  if (!group) {
    throw new Error(`expo-google-tag-manager: Xcode group "${projectName}" was not found`);
  }
  return group;
}

function resourcesPhase(project: XcodeProject, projectName: string): { files: CommentedUuid[] } {
  const { uuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project, projectName });
  return project.pbxResourcesBuildPhaseObj(uuid);
}
