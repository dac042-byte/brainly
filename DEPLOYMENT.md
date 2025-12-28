# BrainGauge Deployment Guide

Complete step-by-step guide for deploying BrainGauge to production and publishing mobile apps.

## Table of Contents
1. [Email Notifications Setup](#email-notifications-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [iOS App Store Publication](#ios-app-store-publication)
4. [Android Google Play Publication](#android-google-play-publication)

---

## Email Notifications Setup

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Click "Start Building" or "Sign Up"
3. Sign up with GitHub or email
4. After signup, click "API Keys" in the left sidebar
5. Click "Create API Key"
6. Name it "BrainGauge Production"
7. Copy the API key (starts with `re_`)
8. **Important**: Save it somewhere safe - you can only see it once!

### Step 2: Configure Domain (Optional but Recommended)

**Without domain setup, emails will come from `onboarding@resend.dev` (works but looks unprofessional)**

1. In Resend dashboard, click "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `braingauge.com`)
4. Resend will show DNS records to add
5. Go to your domain registrar (Namecheap, GoDaddy, etc.)
6. Add the DNS records Resend shows you:
   - TXT record for verification
   - MX records for receiving
   - CNAME for sending
7. Wait 5-30 minutes for DNS to propagate
8. Click "Verify" in Resend
9. Once verified, update the email addresses in:
   - `src/app/api/cron/send-reminders/route.ts` (line 57)
   - `src/app/api/cron/check-limits/route.ts` (line 63)

### Step 3: Generate Cron Secret

Navigate to project folder:
```bash
cd /home/user/brainly
```

Generate secret:
```bash
openssl rand -base64 32
```

Copy the output (this is your CRON_SECRET)

### Step 4: Update Environment Variables

Update `.env.local` with your actual values:

```bash
# Email service (Resend)
RESEND_API_KEY=re_abc123xyz_YOUR_ACTUAL_KEY_HERE

# Cron job security
CRON_SECRET=the_output_from_openssl_command

# Admin notifications
ADMIN_EMAIL=youremail@gmail.com

# App URL (update after deploying to Vercel)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## Vercel Deployment

**IMPORTANT: All commands must be run in the project folder: `/home/user/brainly`**

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Your Project

```bash
vercel
```

Answer prompts:
- "Set up and deploy?" → **Yes**
- "Which scope?" → Your account
- "Link to existing project?" → **No**
- "Project name?" → **braingauge** (or whatever you want)
- "In which directory?" → `./` (press Enter)
- "Override settings?" → **No**

### Step 4: Add Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Click "Settings" → "Environment Variables"
4. Add each variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ASSEMBLYAI_API_KEY`
   - `RESEND_API_KEY`
   - `CRON_SECRET`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (use your Vercel URL: `https://braingauge.vercel.app`)

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 6: Configure Cron Jobs

The `vercel.json` file is already configured with two cron jobs:
- Weekly reminders: Mondays at 9:00 AM UTC
- Daily limit checks: Every day at 12:00 AM UTC

**Option A: Vercel Pro Plan** ($20/month)
- Automatic cron support
- Jobs run automatically

**Option B: Free Tier Workaround**

Use [cron-job.org](https://cron-job.org) (free):

1. Sign up at cron-job.org
2. Create two jobs:

**Job 1: Weekly Reminders**
- URL: `https://braingauge.vercel.app/api/cron/send-reminders`
- Schedule: Every Monday at 9:00 AM
- HTTP Header: `Authorization: Bearer YOUR_CRON_SECRET`

**Job 2: Daily Limit Checks**
- URL: `https://braingauge.vercel.app/api/cron/check-limits`
- Schedule: Every day at 12:00 AM
- HTTP Header: `Authorization: Bearer YOUR_CRON_SECRET`

### Step 7: Test Email System

Test the cron endpoints manually (replace with your values):

```bash
curl -X GET https://braingauge.vercel.app/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl -X GET https://braingauge.vercel.app/api/cron/check-limits \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## iOS App Store Publication

### Prerequisites

- **Mac computer** (required - no workarounds)
- **Xcode 14+** installed
- **Apple Developer Account** ($99/year)

### Step 1: Install Capacitor

Navigate to project folder:
```bash
cd /home/user/brainly
```

Rename the example config file:
```bash
mv capacitor.config.ts.example capacitor.config.ts
```

Install Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

When prompted:
- App name: **BrainGauge**
- App package ID: **com.yourdomain.braingauge** (use your actual domain backwards)
- Web asset directory: **out**

**Note**: This will overwrite the existing capacitor.config.ts. Edit it after to match your domain and app settings.

### Step 2: Add iOS Platform

```bash
npm install @capacitor/ios
npx cap add ios
```

### Step 3: Build and Open in Xcode

```bash
npm run build:mobile
npx cap sync ios
npx cap open ios
```

Xcode will open with your project.

### Step 4: Configure iOS Project in Xcode

1. **Select your project** in left sidebar (top item)
2. **General tab**:
   - Display Name: **BrainGauge**
   - Bundle Identifier: **com.braingauge.app** (must be unique)
   - Version: **1.0.0**
   - Build: **1**
   - Deployment Target: **iOS 13.0** or higher

3. **Signing & Capabilities tab**:
   - Check "Automatically manage signing"
   - Team: Select your Apple Developer account
   - If you don't see your team, click "Add Account" and sign in

4. **Add Microphone Permission**:
   - Click "Info" tab
   - Right-click in the list → "Add Row"
   - Key: **Privacy - Microphone Usage Description**
   - Value: **BrainGauge needs microphone access to analyze your speech patterns for cognitive assessment**

### Step 5: Test on Simulator

1. In Xcode, select a simulator (e.g., "iPhone 15 Pro")
2. Click the Play button (▶️) or press Cmd+R
3. App will launch in simulator
4. Test features (note: microphone won't work in simulator)

### Step 6: Test on Real iPhone

1. Connect your iPhone via USB
2. On iPhone: Settings → General → VPN & Device Management
3. Trust your developer certificate
4. In Xcode, select your iPhone from device dropdown
5. Click Play button
6. Test all features including microphone

### Step 7: Create App Store Connect Listing

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Sign in with Apple Developer account
3. Click "My Apps" → "+" → "New App"
4. Fill in details:
   - Platform: **iOS**
   - Name: **BrainGauge**
   - Primary Language: **English (U.S.)**
   - Bundle ID: Select **com.braingauge.app**
   - SKU: **braingauge-ios** (any unique ID)
   - User Access: **Full Access**
5. Click "Create"

### Step 8: Prepare App Store Assets

Required assets:

**App Icon** (1024x1024 PNG, no transparency)
- Create in Figma/Photoshop
- Should match your brand

**Screenshots** (required for at least one device)
- iPhone 6.7" (iPhone 15 Pro Max): 1290 x 2796 pixels
- Take 3-5 screenshots showing:
  - Login screen
  - Test in progress
  - Dashboard with results
  - Insights/trends

**App Preview Video** (optional but recommended)
- 30 seconds max
- Shows how the app works

### Step 9: Fill Out App Store Information

In App Store Connect:

1. **App Information**:
   - Category: **Medical** or **Health & Fitness**
   - Content Rights: Check if you have rights

2. **Pricing and Availability**:
   - Price: **Free**
   - Availability: **All countries**

3. **App Privacy**:
   - Click "Get Started"
   - Data Collection:
     - Health Data: Yes (cognitive test results)
     - Email Address: Yes
     - Audio Data: Yes
   - Data Usage:
     - Analytics
     - App Functionality
   - Data Linking: Linked to user
   - Tracking: No (unless you add analytics)

4. **Version Information**:
   - Screenshots: Upload your screenshots
   - Promotional Text: Short tagline
   - Description:
   ```
   BrainGauge helps you track your cognitive health over time through quick, science-based assessments.

   Take just 2 minutes per week to:
   • Test reaction time
   • Analyze speech patterns
   • Check memory recall

   Monitor trends and detect changes early. Your data stays private and secure.
   ```
   - Keywords: cognitive, brain, health, memory, reaction, assessment
   - Support URL: Your website
   - Marketing URL: (optional)

### Step 10: Build for App Store

1. In Xcode:
   - Product → Scheme → Edit Scheme
   - Run → Build Configuration → **Release**
   - Close

2. Select **Any iOS Device (arm64)** from device dropdown

3. Product → Archive

4. Wait for archive to complete

5. Organizer window opens → Click "Distribute App"

6. Select "App Store Connect" → Next

7. Select "Upload" → Next

8. Leave defaults → Next

9. Review info → Upload

10. Wait for upload (5-15 minutes)

### Step 11: Submit for Review

1. Go back to App Store Connect
2. Your build should appear under "Build" (refresh if needed)
3. Click the build number to select it
4. **Export Compliance**: Does your app use encryption? **No**
5. **Advertising Identifier**: **No**
6. Fill out **App Review Information**:
   - Demo account (create a test user if needed)
   - Notes: "This app helps users track cognitive health through reaction time, speech analysis, and memory tests"
7. Click **"Add for Review"**
8. Click **"Submit to App Review"**

### Step 12: Wait for Review

- Review takes **1-3 days** typically
- Apple may ask questions or request changes
- Check email and App Store Connect regularly
- Once approved, app goes live automatically

---

## Android Google Play Publication

### Prerequisites

- Any computer (Mac, Windows, Linux)
- Android Studio installed
- Google Play Developer Account ($25 one-time)

### Step 1: Add Android Platform

Navigate to project folder:
```bash
cd /home/user/brainly
```

**If you haven't done iOS setup yet**, first install Capacitor:
```bash
mv capacitor.config.ts.example capacitor.config.ts
npm install @capacitor/core @capacitor/cli
```

Install and add Android:
```bash
npm install @capacitor/android
npx cap add android
```

### Step 2: Build and Open in Android Studio

```bash
npm run build:mobile
npx cap sync android
npx cap open android
```

Android Studio will open.

### Step 3: Configure Android Project

1. **Update App Name**:
   - Open `android/app/src/main/res/values/strings.xml`
   - Change app name to "BrainGauge"

2. **Update Package Name**:
   - Already set in `capacitor.config.ts` as `com.braingauge.app`

3. **Add Permissions**:
   - Open `android/app/src/main/AndroidManifest.xml`
   - Add before `<application>`:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

### Step 4: Create App Icon

1. Right-click `android/app/src/main/res`
2. New → Image Asset
3. Icon Type: **Launcher Icons**
4. Asset Type: **Image**
5. Path: Select your 1024x1024 icon
6. Trim: **No**
7. Resize: **100%**
8. Shape: **None** (or choose rounded square)
9. Click **Next** → **Finish**

### Step 5: Test on Emulator

1. In Android Studio, click "Device Manager" (phone icon)
2. Create device if needed (Pixel 6, Android 13+)
3. Start emulator
4. Click Run (green play button)
5. App installs and launches
6. Test all features

### Step 6: Create Google Play Developer Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Sign in with Google account
3. Pay **$25 one-time registration fee**
4. Fill out developer profile
5. Accept agreements

### Step 7: Create App in Play Console

1. Click "Create app"
2. Fill details:
   - App name: **BrainGauge**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
3. Check declarations
4. Click "Create app"

### Step 8: Fill Out Store Listing

1. **Main store listing**:
   - Short description (80 chars):
   ```
   Track your cognitive health with quick, weekly brain assessments
   ```
   - Full description:
   ```
   BrainGauge helps you monitor your cognitive health over time through quick, science-based assessments.

   FEATURES:
   • Reaction Time Test - Measure response speed and consistency
   • Speech Analysis - Track verbal fluency and articulation
   • Memory Recall - Test short-term memory retention
   • Progress Tracking - View trends over weeks and months
   • Private & Secure - Your data stays encrypted

   HOW IT WORKS:
   Take a 2-minute test once per week. BrainGauge establishes your personal baseline and tracks changes over time, helping you detect potential cognitive changes early.

   Perfect for anyone interested in:
   - Monitoring brain health as they age
   - Tracking recovery from concussion
   - Optimizing cognitive performance
   - Understanding medication effects
   ```
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: Upload 2-8 phone screenshots

2. **Contact details**:
   - Email: Your email
   - Website: Your website
   - Phone: Optional

3. Click **Save**

### Step 9: Set Up Content Rating

1. Click "Content rating" in left sidebar
2. Click "Start questionnaire"
3. Enter email address
4. Category: **Utility, Productivity, Communication, or Other**
5. Answer questions (select "No" for violence, sex, etc.)
6. Submit
7. Rating generated (likely "Everyone")
8. Save

### Step 10: Set Up Target Audience

1. Click "Target audience and content"
2. Target age: **18+**
3. Click **Next** → **Save**

### Step 11: Set Up Data Safety

1. Click "Data safety"
2. Data collection:
   - Collects data: **Yes**
   - Shares data: **No**
3. Data types collected:
   - Personal info: Email address
   - Health and fitness: Health info
   - Audio: Voice recordings
4. Data usage:
   - App functionality
   - Analytics
5. Data security:
   - Data encrypted in transit: **Yes**
   - Data encrypted at rest: **Yes**
   - Users can request deletion: **Yes**
6. Save

### Step 12: Generate Signed APK/AAB

1. In Android Studio: Build → Generate Signed Bundle / APK
2. Select **Android App Bundle** → Next
3. Create keystore:
   - Click "Create new..."
   - Key store path: Choose location (e.g., `~/braingauge-key.jks`)
   - Password: Choose strong password (**SAVE THIS!**)
   - Alias: **braingauge**
   - Alias password: Same or different (**SAVE THIS!**)
   - Validity: **25 years**
   - Certificate info: Your name/company
   - Click OK
4. Next → Select **release** → Finish
5. Wait for build (5-10 minutes)
6. Find AAB at `android/app/release/app-release.aab`

**CRITICAL**: Back up your keystore file! If you lose it, you can never update your app!

### Step 13: Upload to Play Console

1. In Play Console, click "Production" in left sidebar
2. Click "Create new release"
3. Upload the `app-release.aab` file
4. Release name: **1.0.0**
5. Release notes:
   ```
   Initial release of BrainGauge
   - Reaction time testing
   - Speech pattern analysis
   - Memory recall assessment
   - Progress tracking dashboard
   ```
6. Click **Save** → **Review release**
7. Click **Start rollout to Production**

### Step 14: Submit for Review

1. Go back to dashboard
2. All sections should have green checkmarks
3. If anything is incomplete, click and complete it
4. Once all green, you'll see "Ready to publish"
5. Click **"Send for review"**

### Step 15: Wait for Approval

- Review takes **1-7 days** (usually 2-3 days)
- First app takes longer
- You'll get email when approved
- App goes live in Google Play Store

---

## Cost Summary

**First Year:**
- Email: $0 (Resend free tier)
- Hosting: $0 (Vercel free tier)
- iOS: $99/year
- Android: $25 one-time
- **Total: $124**

**Subsequent Years:**
- Email: $0
- Hosting: $0
- iOS: $99/year
- Android: $0
- **Total: $99/year**

---

## Important Notes

1. **All terminal commands must be run in the project folder**: `/home/user/brainly`

2. **Mobile apps still need Vercel**: The Capacitor apps call your Vercel API endpoints. Both web and mobile versions need the Vercel backend.

3. **Environment variables**: Make sure to update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL.

4. **Custom domain for emails**: Update the email "from" addresses in the cron job files after setting up your custom domain in Resend.

5. **Backup your Android keystore**: You cannot update your Android app if you lose the keystore file!

6. **Test thoroughly**: Test all features (especially microphone/audio) on real devices before submitting to app stores.

---

## Support

For issues or questions:
- Check the main README.md
- Review Vercel logs for deployment issues
- Check Supabase dashboard for database issues
- Review App Store Connect / Play Console for app review feedback
