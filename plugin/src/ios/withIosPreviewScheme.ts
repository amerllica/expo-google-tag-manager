import { type ConfigPlugin, type InfoPlist, withInfoPlist } from 'expo/config-plugins';

export const withIosPreviewScheme: ConfigPlugin = (config) =>
  withInfoPlist(config, (config) => {
    const bundleIdentifier = config.ios?.bundleIdentifier;
    if (!bundleIdentifier) {
      throw new Error(
        'expo-google-tag-manager: "ios.bundleIdentifier" is required when "enablePreview" is true'
      );
    }
    config.modResults = addPreviewUrlScheme(config.modResults, bundleIdentifier);
    return config;
  });

export function addPreviewUrlScheme(infoPlist: InfoPlist, bundleIdentifier: string): InfoPlist {
  const scheme = `tagmanager.c.${bundleIdentifier}`;
  const urlTypes = infoPlist.CFBundleURLTypes ?? [];
  if (urlTypes.some((urlType) => urlType.CFBundleURLSchemes.includes(scheme))) return infoPlist;

  return {
    ...infoPlist,
    CFBundleURLTypes: [...urlTypes, { CFBundleURLSchemes: [scheme] }],
  };
}
