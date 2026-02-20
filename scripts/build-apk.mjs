#!/usr/bin/env node

/**
 * Build script for generating the DLM Radio TWA APK using @bubblewrap/core.
 *
 * Prerequisites (one-time setup):
 *   brew install openjdk
 *   npm install --save-dev @bubblewrap/cli
 *   Download Android SDK command-line tools to ~/.bubblewrap/android_sdk/
 *   Install build-tools via sdkmanager
 *
 * Usage:
 *   node scripts/build-apk.mjs
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
const ANDROID_DIR = join(PROJECT_ROOT, 'android');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'downloads');
const OUTPUT_APK = join(OUTPUT_DIR, 'dlm-radio.apk');

const BUBBLEWRAP_HOME = join(homedir(), '.bubblewrap');
const CONFIG_PATH = join(BUBBLEWRAP_HOME, 'config.json');

const JDK_PATH = join(BUBBLEWRAP_HOME, 'jdk', 'jdk-17.0.14+7');
const JAVA_BIN = join(JDK_PATH, 'Contents', 'Home', 'bin');
const SDK_PATH = join(BUBBLEWRAP_HOME, 'android_sdk');

const KEYSTORE_PATH = join(ANDROID_DIR, 'android.keystore');
const KEY_ALIAS = 'dlm-radio';
const STORE_PASS = 'AW3s0m3_DLM_R4d10!';
const KEY_PASS = 'AW3s0m3_DLM_R4d10!';

function ensureConfig() {
  mkdirSync(BUBBLEWRAP_HOME, { recursive: true });
  const config = { jdkPath: JDK_PATH, androidSdkPath: SDK_PATH };
  writeFileSync(CONFIG_PATH, JSON.stringify(config));
  console.log('[build-apk] Config written:', CONFIG_PATH);
}

function ensureKeystore() {
  if (existsSync(KEYSTORE_PATH)) {
    console.log('[build-apk] Keystore already exists at', KEYSTORE_PATH);
    return;
  }

  console.log('[build-apk] Generating signing keystore...');
  const keytoolCmd = join(JAVA_BIN, 'keytool');
  const dname = 'CN=DLM Radio,OU=Development,O=DLM Media,L=Unknown,ST=Unknown,C=US';

  execSync([
    `"${keytoolCmd}"`,
    '-genkeypair',
    '-keystore', `"${KEYSTORE_PATH}"`,
    '-alias', KEY_ALIAS,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-storepass', STORE_PASS,
    '-keypass', KEY_PASS,
    '-dname', `"${dname}"`,
  ].join(' '), { stdio: 'inherit' });

  console.log('[build-apk] Keystore created at', KEYSTORE_PATH);
}

async function getKeystoreFingerprint() {
  const keytoolCmd = join(JAVA_BIN, 'keytool');
  const output = execSync([
    `"${keytoolCmd}"`,
    '-list', '-v',
    '-keystore', `"${KEYSTORE_PATH}"`,
    '-alias', KEY_ALIAS,
    '-storepass', STORE_PASS,
  ].join(' '), { encoding: 'utf-8' });

  const sha256Match = output.match(/SHA256:\s*([A-F0-9:]+)/i);
  if (sha256Match) {
    return sha256Match[1];
  }
  console.warn('[build-apk] Could not extract SHA-256 fingerprint');
  return null;
}

function updateAssetLinks(fingerprint) {
  if (!fingerprint) return;

  const assetLinksPath = join(PROJECT_ROOT, 'public', '.well-known', 'assetlinks.json');
  const assetLinks = [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.dlm.radio',
      sha256_cert_fingerprints: [fingerprint],
    },
  }];

  writeFileSync(assetLinksPath, JSON.stringify(assetLinks, null, 2));
  console.log('[build-apk] Updated assetlinks.json with fingerprint:', fingerprint);
}

async function buildApk() {
  console.log('[build-apk] Starting APK build...\n');

  ensureConfig();
  ensureKeystore();

  const fingerprint = await getKeystoreFingerprint();
  updateAssetLinks(fingerprint);

  const { Config, ConsoleLog, JdkHelper, AndroidSdkTools, TwaManifest, TwaGenerator, GradleWrapper, KeyTool, JarSigner } =
    await import('@bubblewrap/core');

  const log = new ConsoleLog('build-apk');
  const config = new Config(JDK_PATH, SDK_PATH);
  const jdkHelper = new JdkHelper(process, config);
  const androidSdkTools = new AndroidSdkTools(process, config, jdkHelper, log);

  const hasBuildTools = await androidSdkTools.checkBuildTools();
  if (!hasBuildTools) {
    console.log('[build-apk] Installing Android build tools...');
    await androidSdkTools.installBuildTools();
  }

  const twaManifestPath = join(ANDROID_DIR, 'twa-manifest.json');
  console.log('[build-apk] Loading TWA manifest from', twaManifestPath);
  const twaManifest = await TwaManifest.fromFile(twaManifestPath);

  const twaGenerator = new TwaGenerator();
  const targetDir = join(ANDROID_DIR, 'build');

  if (existsSync(targetDir)) {
    console.log('[build-apk] Cleaning previous build directory...');
    execSync(`rm -rf "${targetDir}"`);
  }
  mkdirSync(targetDir, { recursive: true });

  console.log('[build-apk] Generating TWA project...');
  await twaGenerator.createTwaProject(targetDir, twaManifest, log);

  console.log('[build-apk] Building APK with Gradle...');
  const gradleWrapper = new GradleWrapper(process, androidSdkTools, targetDir);
  await gradleWrapper.assembleRelease();

  const unsignedApk = join(targetDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
  if (!existsSync(unsignedApk)) {
    const altApk = join(targetDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (existsSync(altApk)) {
      console.log('[build-apk] Found app-release.apk');
    } else {
      console.error('[build-apk] ERROR: APK not found after build.');
      console.log('[build-apk] Searching for APK files...');
      const result = execSync(`find "${targetDir}" -name "*.apk" 2>/dev/null`, { encoding: 'utf-8' });
      console.log(result || '  No APK files found');
      process.exit(1);
    }
  }

  const alignedApk = join(ANDROID_DIR, 'app-release-aligned.apk');
  const signedApk = join(ANDROID_DIR, 'app-release-signed.apk');

  console.log('[build-apk] Aligning APK...');
  await androidSdkTools.zipalign(unsignedApk, alignedApk);

  console.log('[build-apk] Signing APK...');
  await androidSdkTools.apksigner(
    KEYSTORE_PATH,
    STORE_PASS,
    KEY_ALIAS,
    KEY_PASS,
    alignedApk,
    signedApk,
  );

  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(signedApk, OUTPUT_APK);

  const stats = execSync(`ls -lh "${OUTPUT_APK}"`, { encoding: 'utf-8' });
  console.log(`\n[build-apk] SUCCESS! APK copied to: ${OUTPUT_APK}`);
  console.log(`[build-apk] ${stats.trim()}`);

  // Cleanup intermediate files
  try {
    execSync(`rm -f "${alignedApk}" "${signedApk}"`);
  } catch { /* ignore cleanup errors */ }
}

buildApk().catch((err) => {
  console.error('[build-apk] Build failed:', err);
  process.exit(1);
});
