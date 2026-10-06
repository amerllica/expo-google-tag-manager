import { type ConfigPlugin, type InfoPlist, withInfoPlist } from 'expo/config-plugins';

import { isPreviewScheme, missingAppIdError, previewScheme } from '../preview';

export const withIosPreviewScheme: ConfigPlugin<boolean> = (config, enabled) =>
  withInfoPlist(config, (config) => {
    removePreviewUrlSchemes(config.modResults);
    if (enabled) {
      const bundleIdentifier = config.ios?.bundleIdentifier;
      if (!bundleIdentifier) throw missingAppIdError('ios.bundleIdentifier');
      addPreviewUrlScheme(config.modResults, bundleIdentifier);
    }
    return config;
  });

export function removePreviewUrlSchemes(infoPlist: InfoPlist) {
  const urlTypes = (infoPlist.CFBundleURLTypes ?? []).flatMap((urlType) => {
    const schemes = urlType.CFBundleURLSchemes.filter((scheme) => !isPreviewScheme(scheme));
    if (schemes.length === urlType.CFBundleURLSchemes.length) return [urlType];
    return schemes.length > 0 ? [{ ...urlType, CFBundleURLSchemes: schemes }] : [];
  });

  if (urlTypes.length > 0) {
    infoPlist.CFBundleURLTypes = urlTypes;
  } else {
    delete infoPlist.CFBundleURLTypes;
  }
}

export function addPreviewUrlScheme(infoPlist: InfoPlist, bundleIdentifier: string) {
  infoPlist.CFBundleURLTypes = [
    ...(infoPlist.CFBundleURLTypes ?? []),
    { CFBundleURLSchemes: [previewScheme(bundleIdentifier)] },
  ];
}
