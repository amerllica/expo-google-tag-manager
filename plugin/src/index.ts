import { createRunOncePlugin } from 'expo/config-plugins';

import { withGoogleTagManager } from './withGoogleTagManager';

const pkg = require('../../package.json');

export default createRunOncePlugin(withGoogleTagManager, pkg.name, pkg.version);
