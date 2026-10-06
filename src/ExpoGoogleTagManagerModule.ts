import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoGoogleTagManagerModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoGoogleTagManagerModule>('ExpoGoogleTagManager');
