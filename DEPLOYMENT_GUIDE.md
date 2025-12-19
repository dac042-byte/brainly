# Cerebro Deployment Guide

## ✅ Build Status: READY TO DEPLOY

Your app now builds successfully! I've fixed all TypeScript errors.

---

## 🚀 Deploy to Vercel Preview (5 minutes)

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Deploy to Preview

```bash
vercel
```

**What this does:**
- Creates a preview deployment (NOT production)
- Gives you a URL like `https://cerebro-abc123.vercel.app`
- Safe to test - not public
- Auto-deploys from your current branch

**Follow the prompts:**
1. "Set up and deploy ~/brainly?" → **Yes**
2. "Which scope?" → Select your account
3. "Link to existing project?" → **No** (first time) or **Yes** (if you have one)
4. "What's your project name?" → `cerebro-mvp` (or whatever you want)
5. "In which directory is your code?" → `.` (current directory)
6. "Want to override settings?" → **No**

**Wait ~2 minutes** for deployment to complete.

### Step 4: Set Environment Variables in Vercel

⚠️ **CRITICAL:** Your `.env.local` file is not deployed. You must add these in Vercel dashboard:

1. Open your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
OPENAI_API_KEY=your-actual-openai-key
```

4. **Redeploy** after adding variables:
   ```bash
   vercel --force
   ```

---

## 🧪 Test Your Preview Deployment

Once deployed, visit your preview URL and test:

### Critical Flow Test (10 minutes):

1. ✅ **Sign Up** - Create a test account
2. ✅ **Login** - Verify auth works
3. ✅ **Dashboard** - Check it loads without errors
4. ✅ **Start Session** - Click "Start Check-In"
5. ✅ **Reaction Test** - Complete the reaction time test
6. ✅ **Speech Test** - Test microphone permissions
   - If it fails, check browser console for errors
   - Verify OPENAI_API_KEY is set in Vercel
7. ✅ **Memory Test** - Skip this (removed in current version)
8. ✅ **View History** - Check your session appears
9. ✅ **Dashboard Charts** - Verify data shows

### Common Issues:

**"Auth Error"**
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify Supabase project is not paused

**"Speech API fails"**
- Check OPENAI_API_KEY is set in Vercel
- Check browser console for specific error

**"No data showing"**
- Complete at least 1 full session
- Check Network tab for failed API calls

---

## 📝 What I Fixed to Make This Deployable

### TypeScript Errors Fixed:
1. ✅ Removed `memory_metrics` references (not in database)
2. ✅ Added `weighted_score` field to SessionDelta type
3. ✅ Updated ThemeToggle to use color schemes
4. ✅ Removed Speech WPM delta (not in database)

### Files Changed:
- `src/app/dashboard/NewDashboardContent.tsx` - Removed memory charts
- `src/app/history/HistoryContent.tsx` - Removed memory cards
- `src/lib/types.ts` - Added weighted_score field
- `src/components/ThemeToggle.tsx` - Fixed theme context usage

### Commit:
```
6fd083c - Fix TypeScript build errors and remove memory metrics references
```

---

## 🎯 Next Steps After Successful Preview

Once your preview deployment works:

### Option A: Deploy to Production
```bash
vercel --prod
```

This deploys to your production domain.

### Option B: Keep Testing on Preview
Keep using preview deployments until you're ready for public launch.

### Option C: Start 2-Week Improvement Plan
Follow the detailed improvement roadmap I provided earlier to:
- Add security validations
- Implement error handling
- Add tests
- Set up monitoring

---

## 🔧 Vercel Configuration

Your app uses these Vercel settings (auto-detected):

**Framework:** Next.js 14
**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`
**Node Version:** 18.x (default)

---

## 📊 Build Output

```
Route (app)                              Size     First Load JS
┌ ƒ /                                    139 B          87.7 kB
├ ƒ /dashboard                           104 kB          255 kB
├ ƒ /history                             2.23 kB        95.5 kB
├ ƒ /login                               1.5 kB          146 kB
├ ƒ /session                             7.87 kB         153 kB
├ ƒ /settings                            3.24 kB         148 kB
└ ƒ /signup                              1.74 kB         147 kB
```

**Total:** ~255 kB for dashboard (largest page)
**Status:** ✅ All pages building successfully

---

## 🚨 Important Notes

1. **Environment Variables:** Never commit `.env.local` to git - always set in Vercel dashboard
2. **Supabase RLS:** Your Row Level Security policies are already configured - users can only see their own data
3. **API Routes:** Speech analysis endpoint at `/api/speech/analyze` works via serverless functions
4. **Edge Middleware:** Auth refresh middleware runs on every request

---

## 🆘 If Deployment Fails

### Build Errors:
```bash
# Check locally first
npm run build

# If it fails, read the error and ping me
```

### Runtime Errors on Vercel:
1. Check Vercel Function Logs in dashboard
2. Look for "500" or "Error" in logs
3. Most common: Missing environment variables

### Network/Supabase Errors:
1. Verify Supabase project is active
2. Check RLS policies allow access
3. Test locally with `npm run dev` first

---

## 📞 Support

If you hit issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test locally first (`npm run dev`)

---

## ✨ You're Ready!

Your app:
- ✅ Builds successfully
- ✅ Has no TypeScript errors
- ✅ Git committed and pushed
- ✅ Ready for Vercel deployment

**Run this command now:**
```bash
vercel
```

Then test the preview URL and report back what you see!
