import { registerWebModule, NativeModule } from 'expo';

// ExpoGoogleTagManagerModule is not available on the web platform.
class ExpoGoogleTagManagerModule extends NativeModule<{}> {}

export default registerWebModule(ExpoGoogleTagManagerModule, 'ExpoGoogleTagManagerModule');
