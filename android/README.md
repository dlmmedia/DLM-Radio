# DLM Radio - Android APK (TWA)

This directory contains the configuration for wrapping the DLM Radio PWA into an
Android APK using **Trusted Web Activity (TWA)** via [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

## Quick Build

```bash
npm run build:apk
```

This runs `scripts/build-apk.mjs` which:
1. Reads `twa-manifest.json` for app configuration
2. Generates a signing keystore (first run only)
3. Updates `public/.well-known/assetlinks.json` with the signing fingerprint
4. Generates the Android TWA project via `@bubblewrap/core`
5. Builds, aligns, and signs the APK
6. Copies the final APK to `public/downloads/dlm-radio.apk`

## Prerequisites

- **Node.js** 14.15.0 or higher
- **Java JDK 17** — downloaded automatically to `~/.bubblewrap/jdk/` on first build
- **Android SDK** — command-line tools at `~/.bubblewrap/android_sdk/`
- **@bubblewrap/cli** — installed as a dev dependency

### One-Time Setup

```bash
# Install JDK 17
mkdir -p ~/.bubblewrap/jdk && cd ~/.bubblewrap/jdk
curl -L -o jdk17.tar.gz "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.14%2B7/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.14_7.tar.gz"
tar xzf jdk17.tar.gz && rm jdk17.tar.gz

# Install Android SDK command-line tools
mkdir -p ~/.bubblewrap/android_sdk && cd ~/.bubblewrap/android_sdk
curl -L -o cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
unzip -q cmdline-tools.zip && rm cmdline-tools.zip
mkdir -p cmdline-tools-temp && mv cmdline-tools cmdline-tools-temp/latest && mv cmdline-tools-temp cmdline-tools

# Install build tools
export JAVA_HOME="$HOME/.bubblewrap/jdk/jdk-17.0.14+7/Contents/Home"
yes | ~/.bubblewrap/android_sdk/cmdline-tools/latest/bin/sdkmanager \
  --sdk_root=$HOME/.bubblewrap/android_sdk \
  "build-tools;34.0.0" "platforms;android-34"
```

## Configuration

Edit `twa-manifest.json` to change:
- `host` — your deployed domain
- `iconUrl` / `maskableIconUrl` — full URLs to your deployed icons
- `webManifestUrl` — your manifest URL
- `packageId` — Android package name
- `appVersion` / `appVersionCode` — bump for each release

## How TWA Works

The APK is a thin Android shell that launches your PWA in a Chrome Custom Tab
with the browser UI removed:

- **No native code** — the APK just points to your web app
- **Auto-updates** — updating the web app updates the Play Store app instantly
- **Full Web API access** — Web Audio, MediaSession, Push Notifications all work
- **Background audio** — continues playing when the app is backgrounded
- **Offline support** — the service worker handles caching

## Important Notes

- The `assetlinks.json` file MUST be served from your domain at
  `/.well-known/assetlinks.json` for TWA verification to work
- If verification fails, the app falls back to a Chrome Custom Tab with a URL bar
- The signing keystore (`android.keystore`) should NEVER be committed to git
