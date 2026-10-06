const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { expo } = require('../app.json');

const [platform, stage] = process.argv.slice(2);
const exampleRoot = path.resolve(__dirname, '..');
const pluginOptions = expo.plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === '../app.plugin.js'
)[1];
const containerFile = path.basename(pluginOptions[platform].container);
const appId = platform === 'ios' ? expo.ios.bundleIdentifier : expo.android.package;
const previewScheme = `tagmanager.c.${appId}`;
const failures = [];

function check(description, passed) {
  console.log(`${passed ? 'ok  ' : 'FAIL'} ${description}`);
  if (!passed) failures.push(description);
}

function readText(...segments) {
  const file = path.join(exampleRoot, ...segments);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function exists(...segments) {
  return fs.existsSync(path.join(exampleRoot, ...segments));
}

function iosProjectName() {
  const xcodeproj = fs
    .readdirSync(path.join(exampleRoot, 'ios'))
    .find((name) => name.endsWith('.xcodeproj'));
  return path.basename(xcodeproj, '.xcodeproj');
}

function checkIosPrebuild() {
  const projectName = iosProjectName();
  const pbxproj = readText('ios', `${projectName}.xcodeproj`, 'project.pbxproj');
  check(
    `ios/${projectName}/container/${containerFile} exists`,
    exists('ios', projectName, 'container', containerFile)
  );
  check(
    'pbxproj has the container folder reference',
    pbxproj.includes('lastKnownFileType = folder; name = container;')
  );
  check(
    'Podfile.lock has GoogleTagManager',
    /^ {2}- GoogleTagManager /m.test(readText('ios', 'Podfile.lock'))
  );
}

function checkIosApp() {
  const app = path.join(
    'ios',
    'build',
    'Build',
    'Products',
    'Debug-iphonesimulator',
    `${iosProjectName()}.app`
  );
  check(`${app}/container/${containerFile} exists`, exists(app, 'container', containerFile));
  if (pluginOptions.enablePreview) {
    const infoPlist = execFileSync(
      'plutil',
      ['-convert', 'json', '-o', '-', path.join(exampleRoot, app, 'Info.plist')],
      { encoding: 'utf8' }
    );
    const schemes = (JSON.parse(infoPlist).CFBundleURLTypes ?? []).flatMap(
      (urlType) => urlType.CFBundleURLSchemes
    );
    check(`Info.plist has the ${previewScheme} URL scheme`, schemes.includes(previewScheme));
  }
}

function checkAndroidPrebuild() {
  const manifest = readText('android', 'app', 'src', 'main', 'AndroidManifest.xml');
  check(
    `assets/containers/${containerFile} exists`,
    exists('android', 'app', 'src', 'main', 'assets', 'containers', containerFile)
  );
  if (pluginOptions.enablePreview) {
    check(
      'AndroidManifest.xml has TagManagerPreviewActivity',
      manifest.includes('com.google.android.gms.tagmanager.TagManagerPreviewActivity')
    );
    check(
      `AndroidManifest.xml has the ${previewScheme} scheme`,
      manifest.includes(`android:scheme="${previewScheme}"`)
    );
  }
}

function checkAndroidApp() {
  const apk = path.join(
    exampleRoot,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'debug',
    'app-debug.apk'
  );
  const entries = fs.existsSync(apk)
    ? execFileSync('unzip', ['-l', apk], { encoding: 'utf8' })
    : '';
  check(
    `app-debug.apk has assets/containers/${containerFile}`,
    entries.includes(`assets/containers/${containerFile}`)
  );
}

const checks = {
  ios: { prebuild: checkIosPrebuild, app: checkIosApp },
  android: { prebuild: checkAndroidPrebuild, app: checkAndroidApp },
};

const run = checks[platform]?.[stage];
if (!run) {
  console.error('Usage: check-native-output <ios|android> <prebuild|app>');
  process.exit(2);
}
run();
process.exit(failures.length > 0 ? 1 : 0);
