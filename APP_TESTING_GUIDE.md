# Cogna - Mobile App Testing Guide

Complete step-by-step guide to test your app before App Store/Play Store submission.

---

## Prerequisites Checklist

### For iOS Testing:
- [ ] Mac computer (required)
- [ ] Xcode installed (latest version from Mac App Store)
- [ ] Physical iPhone (recommended) OR iOS Simulator
- [ ] Apple Developer account (for device testing)

### For Android Testing:
- [ ] Android Studio installed
- [ ] Physical Android phone (recommended) OR Android Emulator
- [ ] USB debugging enabled on phone (if using physical device)

---

# iOS Testing (Mac Required)

## Step 1: Install Xcode & Command Line Tools

```bash
# Install Xcode from Mac App Store first, then:
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

## Step 2: Open iOS Project

```bash
# From your project root directory
cd /path/to/brainly

# Open iOS project in Xcode
npx cap open ios
```

This will open `ios/App/App.xcworkspace` in Xcode.

## Step 3: Configure Signing (First Time Only)

1. In Xcode, select **App** in the left sidebar (blue icon)
2. Select the **App** target under TARGETS
3. Go to **Signing & Capabilities** tab
4. Under **Team**, select your Apple Developer account
   - If not listed, click "Add Account" and sign in
5. Xcode will automatically fix signing issues

**Note:** For simulator testing, you don't need a paid developer account. For physical device testing, you need the $99/year Apple Developer Program.

## Step 4: Update Info.plist Permissions

The speech test needs microphone access. Let's verify:

1. In Xcode, open `ios/App/App/Info.plist`
2. Check for these keys (add if missing):

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Cogna needs microphone access to conduct speech timing tests for cognitive performance tracking.</string>
<key>NSCameraUsageDescription</key>
<string>Cogna may need camera access for future features.</string>
```

## Step 5: Build and Run

### Option A: Run on Simulator (Easier, Free)

1. At the top of Xcode, select a simulator device:
   - Click device dropdown → Select **iPhone 15** (or any recent iPhone)
2. Click the **Play ▶** button (or press Cmd+R)
3. Wait for build to complete (2-5 minutes first time)
4. Simulator will launch with your app

**Limitations:** Microphone may not work perfectly in simulator.

### Option B: Run on Physical Device (Recommended)

1. Connect your iPhone via USB
2. Trust the computer on your iPhone if prompted
3. In Xcode, select your iPhone from device dropdown
4. Click the **Play ▶** button (or press Cmd+R)
5. On your iPhone:
   - Go to Settings → General → VPN & Device Management
   - Trust your developer certificate
6. Tap the Cogna app icon to launch

## Step 6: Testing Checklist - iOS

Go through each feature systematically:

### ✅ Initial Load
- [ ] App launches without crash
- [ ] Landing page loads (should show cognaapp.com content)
- [ ] All text is visible (white text on dark background)
- [ ] Pink colors look correct (brighter than before)
- [ ] Logo displays correctly

### ✅ Authentication
- [ ] Click "Start Free" button
- [ ] Sign up with email works
- [ ] Email verification link works
- [ ] Login works
- [ ] Logout works
- [ ] Can log back in

### ✅ Dashboard
- [ ] Dashboard loads after login
- [ ] Sidebar menu opens/closes (hamburger icon on mobile)
- [ ] Theme toggle works (try all 3 themes)
- [ ] "Start Session" button works
- [ ] Navigation works (Dashboard, Mission, History, Settings)

### ✅ Session Flow - CRITICAL TESTING
- [ ] Click "Start Session"
- [ ] **Reaction Time Test:**
  - [ ] Practice trials work
  - [ ] Real trials work
  - [ ] Square clickable area is large enough
  - [ ] Green appears instantly (no animation delay)
  - [ ] Can complete all trials
- [ ] **Memory Encoding:**
  - [ ] Words display clearly (3-5 words)
  - [ ] 10-second countdown works
  - [ ] Auto-advances after timer
- [ ] **Speech Test (IMPORTANT - Needs Microphone):**
  - [ ] Microphone permission prompt appears
  - [ ] Grant permission
  - [ ] Recording starts (timer shows)
  - [ ] Can speak for 30 seconds
  - [ ] Recording stops automatically
  - [ ] Can hear playback
  - [ ] "Redo" works if needed
  - [ ] "Continue" proceeds to next test
- [ ] **Memory Recall:**
  - [ ] Can type words in text area
  - [ ] Submit button works
- [ ] **Results Screen:**
  - [ ] Score displays (0-100)
  - [ ] Individual test results show
  - [ ] "View Dashboard" button works

### ✅ History Page
- [ ] Past sessions appear
- [ ] Session details are correct
- [ ] Can scroll through history

### ✅ Settings Page
- [ ] Email displays correctly
- [ ] Theme picker works
- [ ] Can change settings
- [ ] Settings persist after app restart

### ✅ Performance & Polish
- [ ] No lag or stuttering
- [ ] Smooth animations
- [ ] Proper keyboard handling
- [ ] App doesn't crash during testing
- [ ] Back button behavior is logical
- [ ] Network requests work (check network in Settings)

### ✅ Offline Behavior
- [ ] Turn off WiFi/Data
- [ ] App shows appropriate error message
- [ ] Doesn't crash when offline

### ✅ App Lifecycle
- [ ] Background app (swipe up)
- [ ] Return to app - state is preserved
- [ ] Force quit app
- [ ] Reopen - login state persists

---

# Android Testing

## Step 1: Install Android Studio

Download from: https://developer.android.com/studio

During installation, ensure these are checked:
- Android SDK
- Android SDK Platform
- Android Virtual Device

## Step 2: Open Android Project

```bash
# From your project root
cd /path/to/brainly

# Open Android project
npx cap open android
```

This opens Android Studio with your project.

## Step 3: Wait for Gradle Sync

First time opening:
1. Android Studio will download dependencies (5-10 minutes)
2. Wait for "Gradle sync successful" message at bottom
3. If errors appear, click "Sync Project with Gradle Files"

## Step 4: Check AndroidManifest.xml Permissions

1. In Android Studio, navigate to:
   - `android/app/src/main/AndroidManifest.xml`
2. Verify these permissions exist (should be there already):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

## Step 5: Build and Run

### Option A: Run on Emulator

1. In Android Studio, click **Device Manager** (phone icon on right sidebar)
2. Click **Create Device**
3. Select **Pixel 6** → Click **Next**
4. Select **Tiramisu (API 33)** → Click **Download** if needed
5. Click **Next** → Click **Finish**
6. Click the **Play ▶** button (or Shift+F10)
7. Select your emulator device
8. Wait for emulator to boot and app to install (3-5 minutes first time)

### Option B: Run on Physical Device (Recommended)

**Enable Developer Mode on Phone:**
1. On Android phone: Settings → About Phone
2. Tap "Build Number" 7 times (enables Developer Mode)
3. Go back to Settings → System → Developer Options
4. Enable **USB Debugging**

**Connect & Run:**
1. Connect phone via USB
2. Allow USB debugging when prompted on phone
3. In Android Studio, your device should appear in device dropdown
4. Click **Play ▶** button
5. App installs and launches on your phone

## Step 6: Testing Checklist - Android

Use the same checklist as iOS above, plus these Android-specific items:

### ✅ Android-Specific
- [ ] Back button works properly (doesn't exit app unexpectedly)
- [ ] App appears in recent apps correctly
- [ ] Notifications work (if any)
- [ ] Status bar shows correctly
- [ ] Splash screen appears
- [ ] App icon looks correct in launcher

### ✅ Permissions on Android
- [ ] Microphone permission prompt appears
- [ ] Permission can be granted/denied
- [ ] App handles permission denial gracefully
- [ ] Can go to Settings → Permissions and change permission

### ✅ Different Screen Sizes
Test on different emulators:
- [ ] Pixel 6 (6.4" normal)
- [ ] Pixel Tablet (10.95" tablet)
- [ ] Pixel 3a (5.6" small)

---

# Common Issues & Fixes

## iOS Issues

### "App crashes on launch"
```bash
# Clean build folder
rm -rf ios/App/build
# Rebuild
npx cap sync ios
npx cap open ios
# Clean in Xcode: Product → Clean Build Folder (Cmd+Shift+K)
```

### "Unable to install on device"
- Check device is unlocked
- Trust the computer on iPhone
- Check Signing & Capabilities in Xcode
- Try different USB cable/port

### "Network requests fail"
Check `capacitor.config.ts` has correct URL:
```typescript
server: {
  url: 'https://cognaapp.com',
  cleartext: true
}
```

### "Microphone doesn't work"
- Check Info.plist has NSMicrophoneUsageDescription
- Reset permissions: Settings → Privacy → Microphone → Delete app
- Reinstall app

## Android Issues

### "Gradle sync failed"
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### "App not installing"
```bash
# Uninstall old version first
adb uninstall com.cognaapp.cogna
# Rebuild and install
npx cap run android
```

### "White screen on launch"
- Check Logcat in Android Studio for errors
- Verify `capacitor.config.ts` server URL
- Check internet connection

### "Microphone permission not requesting"
- Check AndroidManifest.xml has RECORD_AUDIO permission
- Uninstall app, reinstall to reset permissions

---

# Performance Testing

## Test on Slower Devices

**iOS:**
- iPhone SE (2020) or older

**Android:**
- Lower-end device or emulator with less RAM

## What to Check:
- [ ] App loads in < 5 seconds
- [ ] Reaction time test is responsive
- [ ] No jank during animations
- [ ] Session completes without crashes

## Network Speed Testing

1. **Slow 3G:**
   - iOS Simulator: Settings → Developer → Network Link Conditioner
   - Android: Chrome DevTools → Network → Slow 3G

2. Test:
   - [ ] App still loads (may be slower)
   - [ ] Error messages appear if too slow
   - [ ] Doesn't crash waiting for network

---

# Pre-Submission Final Checks

## Before Uploading to App Stores

### ✅ Configuration
- [ ] `capacitor.config.ts` points to production URL (cognaapp.com)
- [ ] App name is "Cogna" (not "App" or default)
- [ ] Bundle ID is correct: `com.cognaapp.cogna`
- [ ] Version number set (1.0.0)

### ✅ Content
- [ ] Privacy Policy exists at cognaapp.com/privacy
- [ ] Terms of Service exists at cognaapp.com/terms
- [ ] All disclaimers present ("Not a medical device")
- [ ] No placeholder text or "TODO" items

### ✅ Assets
- [ ] App icon set (1024x1024 for both platforms)
- [ ] Splash screen shows
- [ ] All images load correctly

### ✅ Testing Results
- [ ] Complete session works end-to-end
- [ ] All 3 tests (reaction, speech, memory) work
- [ ] Results save to database
- [ ] History shows past sessions
- [ ] No crashes in 10 complete sessions
- [ ] Works on slow network
- [ ] Works after force quit/reopen

### ✅ Legal & Compliance
- [ ] App doesn't claim to diagnose/treat medical conditions
- [ ] Privacy policy covers data collection
- [ ] Age rating is appropriate (likely 4+ or Everyone)
- [ ] No copyrighted content without permission

---

# Quick Test Script

Run this complete flow to catch most issues:

**5-Minute Test:**
1. ✅ Launch app
2. ✅ Create account
3. ✅ Complete full session (all 3 tests)
4. ✅ View results on dashboard
5. ✅ Check history page
6. ✅ Change theme in settings
7. ✅ Logout
8. ✅ Login again
9. ✅ Force quit app
10. ✅ Reopen - verify session history persists

**If all 10 steps work:** App is ready for submission!

---

# Debugging Commands

## View iOS Logs
```bash
# Terminal - watch logs from connected device
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "Cogna"'

# Or in Xcode: Window → Devices and Simulators → Open Console
```

## View Android Logs
```bash
# Terminal
adb logcat | grep Cogna

# Or in Android Studio: Logcat tab at bottom
```

## Reset Everything (Clean Start)
```bash
# iOS
rm -rf ios/App/build
rm -rf ios/App/Pods

# Android
cd android && ./gradlew clean && cd ..

# Capacitor
rm -rf node_modules
npm install
npx cap sync
```

---

# Next Steps After Testing

Once everything passes:

**For iOS:**
1. Archive the app in Xcode (Product → Archive)
2. Upload to App Store Connect
3. See `APP_STORE_GUIDE.md` for submission details

**For Android:**
1. Generate signed bundle (Build → Generate Signed Bundle)
2. Upload to Google Play Console
3. See `APP_STORE_GUIDE.md` for submission details

---

# Getting Help

If you encounter issues:

1. Check Capacitor docs: https://capacitorjs.com/docs
2. Search error messages on Stack Overflow
3. Check Capacitor GitHub issues: https://github.com/ionic-team/capacitor/issues
4. Post in Capacitor Discord: https://discord.gg/UPYYRhtyzp

**Common search terms:**
- "Capacitor [your error]"
- "Capacitor iOS microphone permission"
- "Capacitor Android network error"
