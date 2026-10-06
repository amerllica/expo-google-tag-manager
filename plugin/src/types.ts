export type PlatformContainer = { container: string };

export type GoogleTagManagerPluginProps = {
  ios?: PlatformContainer;
  android?: PlatformContainer;
  enablePreview?: boolean;
};
