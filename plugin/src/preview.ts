const PREVIEW_SCHEME_PREFIX = 'tagmanager.c.';

export function previewScheme(appId: string) {
  return `${PREVIEW_SCHEME_PREFIX}${appId}`;
}

export function isPreviewScheme(scheme: string) {
  return scheme.startsWith(PREVIEW_SCHEME_PREFIX);
}

export function missingAppIdError(appIdField: string) {
  return new Error(
    `expo-google-tag-manager: "${appIdField}" is required when "enablePreview" is true`
  );
}
