# Complete Production Setup Guide

This guide walks you through every step to get Cerebro live in production.

---

## Part 1: Supabase Configuration (15 minutes)

### Step 1: Verify Row Level Security (RLS) Policies

**Why you need this:** RLS prevents users from seeing each other's data. Critical for privacy.

**What to do:**

1. Open your browser and go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your **Cerebro project**
4. In the left sidebar, click **Table Editor**

**Now check each table:**

For **each** of these tables, you'll verify RLS is enabled:
- `user_profiles`
- `sessions`
- `reaction_metrics`
- `speech_metrics`
- `memory_tests`
- `session_deltas`
- `baseline_tracking`
- `user_streaks`

**For each table:**

1. Click the table name (e.g., click `user_profiles`)
2. Look at the top - you should see a **shield icon** with "RLS enabled"
3. Click the shield icon OR click the **Policies** tab
4. You should see at least 3 policies:
   - `Users can view own [table]` (SELECT)
   - `Users can insert own [table]` (INSERT)
   - `Users can update own [table]` (UPDATE)

**If you DON'T see policies:**

1. Click **"New Policy"** button (green button)
2. Click **"Create policy"**
3. Click **"For full customization"**
4. Fill in:
   - **Policy name:** `Users can view own user_profiles`
   - **Allowed operation:** Check **SELECT**
   - **Target roles:** Check **authenticated**
5. Scroll down to **USING expression** and paste:
   ```sql
   auth.uid() = id
   ```
6. Click **Review**
7. Click **Save policy**

Repeat for INSERT and UPDATE (same USING expression for each).

**For related tables** (reaction_metrics, speech_metrics, memory_tests, session_deltas):

Use this USING expression instead:
```sql
auth.uid() = (SELECT user_id FROM sessions WHERE sessions.id = session_id)
```

---

### Step 2: Turn OFF Email Confirmation

**Why:** We removed email verification from the app code, so Supabase needs to match.

**What to do:**

1. Still in Supabase, click **Authentication** in left sidebar
2. Click **Providers**
3. Find the **Email** provider and click it
4. Scroll down to find **"Confirm email"** toggle
5. Make sure it's **OFF** (gray, not green)
6. Click **Save** at the bottom

---

### Step 3: Add Redirect URLs

**Why:** Supabase needs to know where it's safe to send users after password resets.

**What to do:**

1. Still in **Authentication**, click **URL Configuration**
2. Scroll down to **Redirect URLs** section
3. You'll see a text box and **"Add URL"** button

**Add these URLs for local development:**

Click **Add URL** and paste each one:
```
http://localhost:3000/auth/callback
```
(click Add URL again)
```
http://localhost:3000/auth/confirm
```
(click Add URL again)
```
http://localhost:3000/reset-password
```

4. Click **Save** at the bottom

**Note:** You'll add production URLs here AFTER you deploy to Vercel (Step 7).

---

### Step 4: Copy Your Supabase Credentials

**You'll need these for Vercel deployment:**

1. In Supabase, click **Settings** in left sidebar (gear icon at bottom)
2. Click **API**
3. You'll see a section called "Project API keys"

**Copy these two values** (paste them somewhere safe):

**Value 1 - Project URL:**
- Look for "Project URL" near the top
- Copy the whole URL (looks like: `https://abcdefgh.supabase.co`)

**Value 2 - anon public key:**
- Scroll down to "Project API keys"
- Find the key labeled **"anon" "public"**
- Click the copy icon to copy it
- It's a very long string starting with `eyJ...`

**Keep these safe - you'll paste them into Vercel in Step 6.**

---

## Part 2: Deploy to Vercel (10 minutes)

### Step 5: Deploy Your App

**Option A: Using Vercel Website (Easiest for first time)**

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Sign in** (or **Sign up** if you don't have an account)
3. Sign in with **GitHub** (recommended)
4. Click **"Add New..."** button (top right)
5. Click **"Project"**
6. You'll see a list of your GitHub repositories
7. Find your `brainly` repository
8. Click **"Import"**

**Configure the project:**

1. **Project Name:** Type `cerebro` (or whatever you want)
2. **Framework Preset:** Should say "Next.js" (auto-detected) ✓
3. **Root Directory:** Leave as `./`
4. **Build Command:** Leave as `npm run build`
5. **Output Directory:** Leave as `.next`

**DO NOT CLICK DEPLOY YET!**

---

### Step 6: Add Environment Variables

**This is critical - don't skip this step!**

1. Scroll down to **Environment Variables** section
2. Click to expand it

**Add Variable #1:**
- **Name:** Type exactly: `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Paste your Project URL from Step 4 (the `https://abcdefgh.supabase.co` one)
- **Environment:** Check ALL THREE boxes: ☑ Production ☑ Preview ☑ Development
- Click **Add**

**Add Variable #2:**
- **Name:** Type exactly: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Paste your anon public key from Step 4 (the long `eyJ...` string)
- **Environment:** Check ALL THREE boxes: ☑ Production ☑ Preview ☑ Development
- Click **Add**

**Now you can deploy:**

3. Click the big **"Deploy"** button at the bottom
4. Wait 2-3 minutes while it builds
5. You'll see a success screen with confetti 🎉
6. Click **"Continue to Dashboard"**

---

### Step 7: Get Your Production URL

**Find your app's URL:**

1. In your Vercel project dashboard, look for **Domains** section
2. You'll see a URL like: `cerebro-abc123.vercel.app`
3. **Copy this URL** - you need it for the next step

---

### Step 8: Add Production URLs to Supabase

**Now that you have your Vercel URL, tell Supabase about it:**

1. Go back to **Supabase** in your browser
2. Go to **Authentication** → **URL Configuration**
3. Scroll to **Redirect URLs**

**Add these three production URLs** (replace `cerebro-abc123.vercel.app` with YOUR actual URL):

Click **Add URL** and paste:
```
https://cerebro-abc123.vercel.app/auth/callback
```

Click **Add URL** and paste:
```
https://cerebro-abc123.vercel.app/auth/confirm
```

Click **Add URL** and paste:
```
https://cerebro-abc123.vercel.app/reset-password
```

4. Click **Save**

---

## Part 3: Test Everything (15 minutes)

### Step 9: Test Your Production App

**Open your production URL** (from Step 7)

**Test 1: Sign Up**
1. Go to `/signup`
2. Enter email and password
3. Click "Create Account"
4. ✅ Should redirect to `/dashboard` immediately (no email to check)
5. ✅ Dashboard should load (may be empty - that's okay!)

**Test 2: Complete a Session**
1. Click **"Start This Week"** button
2. Complete all three tests:
   - Reaction time test
   - Speech test
   - Memory test
3. ✅ Should redirect to dashboard
4. ✅ Should see your results on dashboard
5. Click **"History"** in sidebar
6. ✅ Should see your session listed

**Test 3: Sign Out and Password Reset**
1. Click **"Sign Out"**
2. Go to `/login`
3. Click **"Forgot password?"**
4. Enter your email
5. ✅ Should see "Check your email" message
6. Check your email inbox
7. ✅ Should receive a password reset email
8. Click the link in email
9. ✅ Should go to `/reset-password` on your domain
10. Enter new password (must have uppercase, lowercase, number, 8+ chars)
11. Click "Update Password"
12. ✅ Should redirect to dashboard

**Test 4: Empty States**
1. Create a NEW account (different email)
2. Go to `/dashboard`
3. ✅ Should see "No Sessions Yet" with brain emoji
4. Go to `/history`
5. ✅ Should see "No Session History" with chart emoji

**Test 5: Legal Pages**
1. Go to `/privacy`
2. ✅ Should load Privacy Policy
3. Go to `/terms`
4. ✅ Should load Terms of Service
5. Check sidebar at bottom
6. ✅ Should see "Privacy" and "Terms" links

**Test 6: Error Pages**
1. Go to `/this-page-does-not-exist`
2. ✅ Should see custom 404 page with "Return to Dashboard" button

**Test 7: Mobile**
1. Open your app on your phone
2. ✅ Everything should be responsive
3. Try completing a session on mobile

---

## Part 4: Optional Improvements

### Step 10: Add a Custom Domain (Optional)

If you own a domain like `cerebro.app`:

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **"Add"**
3. Type your domain: `cerebro.app`
4. Vercel will show you DNS records to add
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Add the CNAME record Vercel shows
7. Wait 10-60 minutes for DNS to update
8. Once verified, **update Supabase redirect URLs** to use your custom domain

---

## Troubleshooting

### Problem: "Invalid JWT" or authentication errors

**Solution:**
1. Check environment variables in Vercel
2. Go to Vercel → Settings → Environment Variables
3. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
4. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
5. If you changed them, **redeploy**: Vercel → Deployments → ⋯ → Redeploy

### Problem: "Password reset email not arriving"

**Solution:**
1. Check spam folder
2. Verify redirect URLs in Supabase include your production domain
3. Check Supabase → Authentication → Email Templates
4. Default template should work - if you customized it, verify `{{ .ConfirmationURL }}` is present

### Problem: Dashboard shows errors or won't load

**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. If you see "Failed to fetch" or database errors:
   - Go to Supabase → Table Editor
   - Verify RLS policies exist (Step 1)
   - Make sure tables have SELECT/INSERT/UPDATE policies

### Problem: Build fails on Vercel

**Solution:**
1. Check deployment logs in Vercel
2. Common causes:
   - TypeScript errors (run `npm run build` locally first)
   - Missing dependencies (run `npm install` locally)
3. If build works locally but not on Vercel:
   - Check Node version (should be 18.x)
   - Verify all dependencies are in `package.json`, not `package-lock.json` only

---

## You're Live! 🎉

**Your app is now in production.**

**Next steps:**
- Share the URL with test users
- Monitor Vercel logs for errors
- Check Supabase database for activity
- Follow PRODUCTION_LAUNCH_GUIDE.md for additional security hardening

**Where to monitor:**

**Vercel:**
- Logs: Vercel → Project → Logs
- Analytics: Vercel → Project → Analytics
- Errors: Look for 500 status codes

**Supabase:**
- Users: Authentication → Users
- Database activity: Database → Logs
- API logs: Project Settings → API → Logs

---

## Quick Checklist

Before announcing to users:

- [ ] RLS policies enabled on all tables
- [ ] Email confirmation is OFF
- [ ] Redirect URLs added (local + production)
- [ ] Environment variables set in Vercel
- [ ] App deployed successfully
- [ ] Tested signup flow
- [ ] Tested session completion
- [ ] Tested password reset email
- [ ] Tested empty states
- [ ] Tested error pages
- [ ] Tested Privacy/Terms pages
- [ ] No errors in browser console
- [ ] Tested on mobile device

---

## Getting Help

If something isn't working:

1. **First:** Check browser console (F12 → Console tab)
2. **Second:** Check Vercel deployment logs
3. **Third:** Check Supabase logs
4. **Common fixes:**
   - Clear browser cache
   - Try incognito/private browsing
   - Verify environment variables
   - Check RLS policies

Most issues are caused by:
- Missing or incorrect environment variables
- Missing RLS policies
- Typos in redirect URLs
