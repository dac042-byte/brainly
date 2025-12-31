# Setting Up Separate Capacitor Testing Environment

This guide shows you how to create and maintain a separate copy of your project for mobile app testing with Capacitor, while keeping your main web app clean.

---

## Strategy Overview

You have **two options** for managing separate versions:

### Option 1: Separate Git Branch (Recommended)
- Main branch: Web app only
- Capacitor branch: Mobile app version
- Easy to sync changes between them
- Clean separation, can deploy both

### Option 2: Separate Directory
- Two completely separate folders
- `brainly/` - Main web app
- `brainly-mobile/` - Mobile version
- More disk space, harder to keep in sync

**We'll use Option 1 (Git Branch)** as it's cleaner and easier to maintain.

---

## Option 1: Separate Git Branch (Recommended)

### Step 1: Create Capacitor Branch

```bash
# Make sure you're on your main branch and everything is committed
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
git pull origin claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4

# Create a new branch for mobile app
git checkout -b claude/mobile-app-capacitor

# Confirm you're on the new branch
git branch
# Should show: * claude/mobile-app-capacitor
```

### Step 2: Install Capacitor on Mobile Branch

```bash
# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init "Cogna" "com.cognaapp.cogna" --web-dir=out

# Add platforms
npx cap add ios
npx cap add android
```

### Step 3: Configure for Mobile

**Update `capacitor.config.ts`:**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cognaapp.cogna',
  appName: 'Cogna',
  webDir: 'out',
  server: {
    // For production mobile app, load from live website
    url: 'https://cognaapp.com',
    cleartext: true
  }
};

export default config;
```

**Update `.gitignore` (add these lines):**

```
# Capacitor
.capacitor
*.orig
*.log

# iOS
ios/App/Pods
ios/App/build
ios/App/App.xcworkspace/xcuserdata
ios/App/App.xcodeproj/xcuserdata

# Android
android/.gradle
android/build
android/app/build
android/.idea
android/local.properties
*.iml
```

### Step 4: Commit Mobile Changes

```bash
git add -A
git commit -m "Add Capacitor for mobile app testing"
git push -u origin claude/mobile-app-capacitor
```

### Step 5: Testing the Mobile App

```bash
# Make sure you're on mobile branch
git checkout claude/mobile-app-capacitor

# iOS (requires Mac + Xcode)
npx cap open ios

# Android (requires Android Studio)
npx cap open android
```

### Step 6: Switching Between Versions

**Work on Web App:**
```bash
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
# Make changes, commit, push
# No Capacitor files here
```

**Work on Mobile App:**
```bash
git checkout claude/mobile-app-capacitor
# Test mobile version
# Has Capacitor, iOS, Android folders
```

### Step 7: Syncing Changes from Web to Mobile

When you make changes to the web app and want them in mobile:

```bash
# On mobile branch
git checkout claude/mobile-app-capacitor

# Merge changes from web branch
git merge claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4

# If there are conflicts (in Capacitor-related files), keep mobile version
# Push updated mobile branch
git push origin claude/mobile-app-capacitor
```

---

## Option 2: Separate Directory

If you prefer completely separate folders:

### Step 1: Clone Your Repo Twice

```bash
# Navigate to parent directory
cd /path/to/parent/folder

# Clone for web app
git clone https://github.com/yourusername/brainly.git brainly-web

# Clone for mobile app
git clone https://github.com/yourusername/brainly.git brainly-mobile
```

### Step 2: Configure Each

**In `brainly-web/`:**
```bash
cd brainly-web
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
# This is your web-only version
```

**In `brainly-mobile/`:**
```bash
cd brainly-mobile
git checkout -b mobile-app

# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Cogna" "com.cognaapp.cogna" --web-dir=out
npx cap add ios
npx cap add android

# Configure as shown above
git add -A
git commit -m "Add Capacitor for mobile"
git push origin mobile-app
```

### Step 3: Syncing Changes

When you update web app and want changes in mobile:

```bash
# In brainly-mobile/
git checkout mobile-app
git fetch origin
git merge origin/claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4

# Resolve conflicts if any
git push origin mobile-app
```

---

## Workflow: Daily Development

### Scenario 1: Working on Web Features

```bash
# Switch to web branch
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4

# Make changes to code
# Test locally: npm run dev
# Commit: git commit -m "Add new feature"
# Push: git push

# Deploy to Vercel (web only)
```

### Scenario 2: Testing Mobile App

```bash
# Switch to mobile branch
git checkout claude/mobile-app-capacitor

# Merge latest web changes
git merge claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4

# Open in Xcode/Android Studio
npx cap open ios
# OR
npx cap open android

# Test on simulator/device
```

### Scenario 3: Updating Both

```bash
# 1. Make changes on web branch
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
# ... make changes ...
git commit -m "Update feature"
git push

# 2. Sync to mobile branch
git checkout claude/mobile-app-capacitor
git merge claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
git push

# 3. Test mobile
npx cap sync  # Sync web code to native platforms
npx cap open ios
```

---

## Key Files in Each Version

### Web Branch (claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4)

**Has:**
- `src/` - Source code
- `public/` - Static files
- `package.json`
- `next.config.js`
- Server actions with `'use server'`

**Does NOT Have:**
- `ios/` folder
- `android/` folder
- `capacitor.config.ts`

### Mobile Branch (claude/mobile-app-capacitor)

**Has Everything From Web Branch, PLUS:**
- `ios/` - iOS app project
- `android/` - Android app project
- `capacitor.config.ts` - Capacitor config
- Capacitor packages in `package.json`

---

## Quick Reference Commands

### Create Mobile Branch (First Time)
```bash
git checkout -b claude/mobile-app-capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Cogna" "com.cognaapp.cogna" --web-dir=out
npx cap add ios
npx cap add android
git add -A
git commit -m "Add Capacitor"
git push -u origin claude/mobile-app-capacitor
```

### Switch to Web Development
```bash
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
npm run dev
```

### Switch to Mobile Testing
```bash
git checkout claude/mobile-app-capacitor
npx cap open ios  # or android
```

### Sync Web Changes to Mobile
```bash
git checkout claude/mobile-app-capacitor
git merge claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
npx cap sync
git push
```

### Delete Mobile Branch (If Needed)
```bash
# Switch away from mobile branch first
git checkout claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4

# Delete local branch
git branch -D claude/mobile-app-capacitor

# Delete remote branch
git push origin --delete claude/mobile-app-capacitor

# Remove mobile files
rm -rf ios android capacitor.config.ts
npm uninstall @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

---

## Advantages of Separate Branch Approach

✅ **Clean Separation**
- Web branch: No mobile bloat
- Mobile branch: Has everything needed for app stores

✅ **Easy to Sync**
- Git merge brings web changes to mobile
- No manual copying

✅ **Deploy Both**
- Web deploys from web branch
- Mobile builds from mobile branch

✅ **Less Disk Space**
- Git stores only differences between branches
- Not duplicating entire codebase

✅ **Safe Experimentation**
- Can test mobile features without breaking web
- Easy to delete mobile branch if not needed

---

## Disadvantages to Consider

⚠️ **Merge Conflicts**
- If you modify same files in both branches
- Solution: Make most changes on web branch, merge to mobile

⚠️ **Remember to Sync**
- Easy to forget to merge web changes to mobile
- Solution: Make syncing part of your workflow

⚠️ **Different Dependencies**
- `package.json` differs between branches
- Solution: Keep web dependencies in both, add mobile-only to mobile branch

---

## Recommended Workflow

### Daily Development:
1. **Develop on Web Branch** - Make all feature/bug fix changes here
2. **Commit & Push** - Push to web branch
3. **Merge to Mobile** - Periodically merge to mobile branch
4. **Test Mobile** - Open in Xcode/Android Studio when needed

### Before Mobile Release:
1. Ensure web branch is stable
2. Merge all web changes to mobile branch
3. Test thoroughly on mobile
4. Build and submit to app stores

### Branch Strategy:
```
main (or your main branch)
  ├── claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4 (web only)
  └── claude/mobile-app-capacitor (web + mobile)
```

---

## Troubleshooting

### "I'm on mobile branch but don't see ios/android folders"
```bash
# They might not be installed yet
npx cap add ios
npx cap add android
```

### "Changes I made on web branch aren't in mobile"
```bash
# Merge web branch into mobile branch
git checkout claude/mobile-app-capacitor
git merge claude/build-braingauge-mvp-018iQcBbiZa2TJfHomQNcwb4
```

### "Merge conflicts in capacitor.config.ts"
```bash
# Keep the mobile version
git checkout --theirs capacitor.config.ts
git add capacitor.config.ts
git commit
```

### "npm packages different between branches"
```bash
# On mobile branch after merge
npm install  # Installs mobile-specific packages
```

---

## Alternative: Git Worktrees (Advanced)

If you want both versions simultaneously without switching branches:

```bash
# Create worktree for mobile in separate folder
git worktree add ../brainly-mobile claude/mobile-app-capacitor

# Now you have:
# brainly/ - main web branch
# brainly-mobile/ - mobile branch
# Both share same .git but different working directories
```

This is advanced but allows you to have both open in different VS Code windows simultaneously.

---

## Conclusion

**For most users, use separate Git branches:**
1. Keeps main web app clean
2. Easy to sync with git merge
3. Can maintain both versions easily
4. Delete mobile branch anytime if not needed

Start with the **Separate Git Branch** approach. If you find you need both simultaneously all the time, consider git worktrees or separate directories later.
