// Reexport the native module. On web, it will be resolved to ExpoGoogleTagManagerModule.web.ts
// and on native platforms to ExpoGoogleTagManagerModule.ts
export { default } from './ExpoGoogleTagManagerModule';
export * from './ExpoGoogleTagManager.types';
