# expo-google-tag-manager

An Expo config plugin that sets up [Google Tag Manager for Firebase](https://developers.google.com/tag-platform/tag-manager/ios/v5) (GTM SDK v5) on iOS and Android during `expo prebuild`.

It does three things:

1. adds the GTM native SDK (`GoogleTagManager` pod, `com.google.android.gms:play-services-tagmanager`) through Expo autolinking
2. copies your exported container JSON files into the right native folders
   - iOS: `ios/<App>/container/GTM-XXXX.json`, added to Xcode as a folder reference (blue folder) in the app target's Copy Bundle Resources phase
   - Android: `android/app/src/main/assets/containers/GTM-XXXX.json`
3. optionally registers the GTM preview URL scheme (iOS) and `TagManagerPreviewActivity` (Android)

It does **not** add a JavaScript API. See [Why no JS API](#why-no-js-api).

## Prerequisites

- An Expo project that uses [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) (`expo prebuild`) or a development build. Expo Go is not supported.
- [`@react-native-firebase/app`](https://rnfirebase.io) and [`@react-native-firebase/analytics`](https://rnfirebase.io/analytics/usage), installed and configured with your `GoogleService-Info.plist` and `google-services.json`. GTM listens to Firebase Analytics events, so Firebase must be set up first.
- iOS static frameworks, which React Native Firebase already requires:

  ```json
  ["expo-build-properties", { "ios": { "useFrameworks": "static" } }]
  ```

- One container per platform, exported from the GTM web UI. GTM uses separate containers for iOS and Android.

## Install

```bash
yarn expo install expo-google-tag-manager
```

Add the plugin to `app.json` (or `app.config.js`):

```json
{
  "expo": {
    "ios": { "bundleIdentifier": "com.example.app" },
    "android": { "package": "com.example.app" },
    "plugins": [
      "@react-native-firebase/app",
      ["expo-build-properties", { "ios": { "useFrameworks": "static" } }],
      [
        "expo-google-tag-manager",
        {
          "ios": { "container": "./gtm/GTM-IOS1234.json" },
          "android": { "container": "./gtm/GTM-AND5678.json" },
          "enablePreview": true
        }
      ]
    ]
  }
}
```

Then regenerate the native projects:

```bash
yarn expo prebuild --clean
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `ios.container` | `string` | — | Path to the iOS container JSON, relative to the project root. |
| `android.container` | `string` | — | Path to the Android container JSON, relative to the project root. |
| `enablePreview` | `boolean` | `false` | Registers the GTM preview URL scheme on iOS and the preview activity on Android. |

Rules:

- Set at least one of `ios` or `android`. Prebuild fails otherwise.
- Name each container file after its GTM id, like `GTM-XXXX.json`. The file must exist and contain valid JSON. GTM downloads already use this name.
- `enablePreview` needs `ios.bundleIdentifier` and `android.package` in your app config.

## Export the container JSON

1. Open [tagmanager.google.com](https://tagmanager.google.com) and select the iOS or Android container.
2. Click **Versions**, open the version you want, then **Actions → Download**.
3. Save the file in your project (for example `gtm/GTM-XXXX.json`) and commit it.
4. Repeat for the other platform's container.

Re-run `yarn expo prebuild` after you replace a container file.

## Preview mode

With `enablePreview: true`:

- iOS: `Info.plist` gets the URL scheme `tagmanager.c.<bundleIdentifier>`.
- Android: `AndroidManifest.xml` gets `com.google.android.gms.tagmanager.TagManagerPreviewActivity` with an intent filter for the scheme `tagmanager.c.<package>`.

To preview a container version:

1. In GTM, click **Preview** on the container. GTM shows a preview link and a QR code.
2. Close the app on the device or simulator.
3. Open the preview link on the device (scan the QR code, or run `xcrun simctl openurl booted "<link>"` / `adb shell am start -a android.intent.action.VIEW -d "<link>"`).
4. The app opens with the preview container. Fire your Firebase Analytics events and check that the tags run.

On Android, `adb shell setprop log.tag.GoogleTagManager VERBOSE` shows GTM logs in Logcat.

## Why no JS API

GTM for Firebase has no runtime API worth wrapping. Your app logs events to Firebase Analytics, and GTM reacts to those events on the device. Use React Native Firebase directly:

```ts
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

await logEvent(getAnalytics(), 'purchase', { value: 9.99, currency: 'USD' });
```

There is no `push()` or data layer, and no support for custom JavaScript tags or variables. The legacy GTM SDKs (v3/v4) are not supported.

## License

MIT
