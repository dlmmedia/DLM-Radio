# DLM Radio - Android APK (TWA)

This directory contains the configuration for wrapping the DLM Radio PWA into an
Android APK using **Trusted Web Activity (TWA)** via [Bubblewrap](https://github.com/nicedoc/nicedoc/nicedoc).

## Prerequisites

- **Node.js** 14.15.0 or higher
- **Java JDK 8** (or 11+)
- **Android SDK** (Bubblewrap can download this for you on first run)
- **Google Play Developer account** ($25 one-time fee)
- The PWA must be **deployed and live** with HTTPS

## Setup

### 1. Install Bubblewrap CLI

```bash
npm install -g @nicedoc/cli
```

### 2. Update Configuration

Edit `twa-manifest.json` and replace:

- `host` with your actual deployed domain (e.g. `dlm-radio.up.railway.app`)
- `iconUrl` and `maskableIconUrl` with full URLs to your deployed icons
- `webManifestUrl` with your actual manifest URL

### 3. Initialize the Project

```bash
cd android
bubblewrap init --manifest=https://YOUR_DOMAIN/manifest.webmanifest
```

Bubblewrap will:
- Download Android SDK dependencies (if needed)
- Generate the Android project
- Prompt you to create a signing key (save it securely!)

### 4. Update Digital Asset Links

After the signing key is created, get the SHA-256 fingerprint:

```bash
keytool -list -v -keystore android.keystore -alias dlm-radio
```

Copy the SHA-256 fingerprint and update `public/.well-known/assetlinks.json` in the
main project, replacing the placeholder value. Then redeploy the web app.

### 5. Build the APK / AAB

```bash
bubblewrap build
```

This generates:
- `app-release-signed.apk` - for direct installation / testing
- `app-release-bundle.aab` - for Google Play Store upload

### 6. Test the APK

```bash
adb install app-release-signed.apk
```

### 7. Publish to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Upload the `.aab` file in Production > Releases
4. Fill in store listing, screenshots, etc.
5. Submit for review

## How TWA Works

The APK is a thin Android shell that launches your PWA in a Chrome Custom Tab
with the browser UI removed. Key benefits:

- **No native code** - the APK just points to your web app
- **Auto-updates** - updating the web app updates the Play Store app instantly
- **Full Web API access** - Web Audio, MediaSession, Push Notifications all work
- **Background audio** - continues playing when the app is backgrounded
- **Offline support** - the service worker handles caching

## Important Notes

- The `assetlinks.json` file MUST be served from your domain at
  `/.well-known/assetlinks.json` for TWA verification to work
- If verification fails, the app falls back to a Chrome Custom Tab with a URL bar
- The signing keystore (`android.keystore`) should NEVER be committed to git
