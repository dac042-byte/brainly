# Cogna - App Store Submission Guide

This guide will help you publish Cogna to the iOS App Store and Google Play Store.

## Current Setup

Your app is configured as a **native wrapper** around your live website (cognaapp.com). This means:
- The app loads your production website inside a native container
- All server-side features work normally (auth, API routes, etc.)
- Updates to the website automatically appear in the app
- No need to rebuild/resubmit the app for content changes

## Prerequisites

### For iOS App Store:
1. **Mac computer** with Xcode installed (required for iOS development)
2. **Apple Developer Account** ($99/year) - Sign up at https://developer.apple.com
3. **Xcode** (latest version) - Download from Mac App Store

### For Google Play Store:
1. **Google Play Developer Account** ($25 one-time fee) - Sign up at https://play.google.com/console
2. **Android Studio** - Download from https://developer.android.com/studio

## App Configuration

**App Name:** Cogna
**Bundle ID:** com.cognaapp.cogna
**Website URL:** https://cognaapp.com

## Step-by-Step: iOS App Store

### 1. Prepare App Icons and Assets

You'll need app icons in various sizes. Use a tool like:
- https://www.appicon.co (free icon generator)
- https://icon.kitchen (icon generator with templates)

Required sizes:
- 1024x1024px (App Store listing)
- Plus various smaller sizes for different devices

### 2. Open Project in Xcode

```bash
cd ios/App
open App.xcworkspace
```

### 3. Configure in Xcode

1. Select your project in the left sidebar
2. Under "Signing & Capabilities":
   - Select your Apple Developer Team
   - Xcode will automatically manage signing
3. Update app version and build number
4. Add app icons to Assets.xcassets

### 4. Build and Test

1. Select a simulator or your physical iPhone as the target device
2. Click the Play button to build and run
3. Test all features thoroughly

### 5. Archive and Upload

1. In Xcode: Product → Archive
2. Once archived, click "Distribute App"
3. Select "App Store Connect"
4. Follow the wizard to upload

### 6. App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create a new app with your Bundle ID
3. Fill in app information:
   - Description
   - Keywords
   - Screenshots (required: iPhone screenshots in multiple sizes)
   - Privacy Policy URL (add to your website)
   - Support URL
4. Submit for review

**Review Time:** Typically 24-48 hours

## Step-by-Step: Google Play Store

### 1. Prepare App Assets

Required assets:
- App icon: 512x512px
- Feature graphic: 1024x500px
- Screenshots: At least 2 screenshots for phones

### 2. Open Project in Android Studio

```bash
# From your project root
npx cap open android
```

### 3. Configure in Android Studio

1. Update `android/app/build.gradle`:
   - Set `versionCode` (increment for each release)
   - Set `versionName` (e.g., "1.0.0")
2. Add app icon in `android/app/src/main/res/` directories

### 4. Generate Signed APK/Bundle

1. In Android Studio: Build → Generate Signed Bundle / APK
2. Select "Android App Bundle" (required for Play Store)
3. Create a new keystore (save this securely!)
4. Fill in keystore details and generate

**Important:** Keep your keystore file and passwords secure. You'll need them for all future updates!

### 5. Google Play Console

1. Go to https://play.google.com/console
2. Create a new app
3. Fill in store listing:
   - App name, description
   - Upload screenshots and graphics
   - Categorize your app
   - Content rating questionnaire
   - Privacy Policy URL
4. Go to "Production" → "Create new release"
5. Upload your AAB file
6. Submit for review

**Review Time:** Typically a few hours to a few days

## App Icons Setup

Your app needs a high-resolution icon. Here's how to add it:

1. Create a 1024x1024px PNG icon (or use your existing logo.png)
2. Use an online tool to generate all required sizes
3. For iOS: Add to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
4. For Android: Add to `android/app/src/main/res/mipmap-*/`

Or use Capacitor's asset generator:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor '#8b4f6a'
```

## Privacy Policy & Terms

Before submission, you MUST have:
- Privacy Policy (required by both stores)
- Terms of Service (recommended)

Add these pages to your website and link them in the app store listings.

## Testing Before Submission

### iOS:
1. Test on real device (not just simulator)
2. Check all permissions (microphone for speech test)
3. Ensure deep links work
4. Test in-app purchases if any

### Android:
1. Test on real device
2. Check all permissions in AndroidManifest.xml
3. Test on different Android versions
4. Ensure proper back button handling

## Common Issues

### iOS:
- **Invalid Bundle**: Check Bundle ID matches in Xcode and App Store Connect
- **Missing permissions**: Add microphone permission description in Info.plist
- **Rejected for minimal functionality**: Explain the cognitive testing purpose clearly

### Android:
- **Signature mismatch**: Using wrong keystore
- **Missing permissions**: Declare all permissions in AndroidManifest.xml
- **API level issues**: Target latest Android API level

## Updating the App

Since your app loads from cognaapp.com:
- **Content updates**: Just update your website (no app update needed!)
- **Native feature changes**: Rebuild and resubmit the app
- **Version bumps**: Required only for native code changes

## Cost Summary

- **iOS**: $99/year (Apple Developer Program)
- **Android**: $25 one-time (Google Play Developer)
- **Total first year**: $124

## Next Steps

1. ✅ Capacitor is installed and configured
2. 📱 Create app icons (1024x1024px recommended)
3. 🍎 If publishing to iOS: Get Mac + Xcode + Apple Developer account
4. 🤖 If publishing to Android: Install Android Studio
5. 📝 Create Privacy Policy and Terms pages on your website
6. 📸 Take screenshots of your app on different devices
7. 🚀 Follow the platform-specific guides above

## Need Help?

- Capacitor Docs: https://capacitorjs.com/docs
- iOS Human Interface Guidelines: https://developer.apple.com/design/
- Android Design Guidelines: https://developer.android.com/design
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

## Development Commands

```bash
# Sync web code to native platforms
npx cap sync

# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio
npx cap open android

# Run on iOS simulator
npx cap run ios

# Run on Android emulator/device
npx cap run android
```
