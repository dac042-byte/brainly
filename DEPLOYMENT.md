# Cerebro Deployment Guide - Small Scale Testing

This guide will help you deploy Cerebro for beta testing with 10-50 users.

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] Supabase account (free tier: 50K monthly active users)
- [ ] AssemblyAI account (free tier: 5 hours/month)

## Part 1: Set Up Production Supabase

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project"
3. Name: `cerebro-production`
4. Database Password: Generate a strong password (save it!)
5. Region: Choose closest to your users
6. Plan: Free tier is fine for testing
7. Wait ~2 minutes for project to provision

### 2. Run Database Migrations

1. In your Supabase dashboard → SQL Editor
2. Click "New Query"
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Copy contents of `supabase/migrations/002_add_baseline_metrics.sql`
6. Paste and click "Run"
7. Verify tables exist: Database → Tables (should see 11 tables)

### 3. Configure Authentication

1. Go to Authentication → URL Configuration
2. Add Site URL: `https://your-app.vercel.app` (you'll update this after deploying)
3. Add Redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local testing)

4. Go to Authentication → Providers
5. Enable **Email** provider
6. Configure email templates (optional):
   - Confirmation: "Welcome to Cerebro! Click to verify your email."
   - Magic Link: "Sign in to Cerebro"

### 4. Get API Keys

1. Go to Project Settings → API
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)

### 5. Set Up Row Level Security (RLS)

RLS is already configured in the migration. Verify it's active:

1. Database → Tables
2. Click any table (e.g., `sessions`)
3. Check that "Enable RLS" toggle is ON
4. Check Policies tab shows policies

## Part 2: Set Up AssemblyAI

### 1. Create Account

1. Go to [assemblyai.com](https://www.assemblyai.com/)
2. Sign up for free account
3. Free tier: 5 hours of transcription/month (~300 test sessions)

### 2. Get API Key

1. Dashboard → API Keys
2. Copy your API key (starts with `xxxx`)
3. Keep this secret - don't commit to git!

## Part 3: Deploy to Vercel

### 1. Push to GitHub

```bash
# Make sure all changes are committed
git add -A
git commit -m "Prepare for production deployment"

# Push to GitHub (create repo first if needed)
git remote add origin https://github.com/YOUR-USERNAME/cerebro.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/log in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Add Environment Variables

In Vercel project settings → Environment Variables, add these:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `ASSEMBLYAI_API_KEY` | Your AssemblyAI key | Production, Preview, Development |

### 4. Deploy

1. Click "Deploy"
2. Wait ~2 minutes for build to complete
3. You'll get a URL like: `https://cerebro-xxxxx.vercel.app`

### 5. Update Supabase URLs

1. Go back to Supabase → Authentication → URL Configuration
2. Update Site URL to your Vercel URL: `https://cerebro-xxxxx.vercel.app`
3. Update Redirect URL: `https://cerebro-xxxxx.vercel.app/auth/callback`

## Part 4: Test the Deployment

### Pre-Launch Checklist

- [ ] Visit your Vercel URL
- [ ] Sign up with a test email
- [ ] Complete full session (memory → reaction → memory recall → speech)
- [ ] Check dashboard shows metrics
- [ ] View history page
- [ ] Test theme switching
- [ ] Verify data in Supabase: Database → Table Editor → sessions

### Common Issues & Fixes

**Issue: Can't sign up / Email not sending**
- Solution: Check Supabase Auth logs (Authentication → Logs)
- Verify email provider is enabled
- Check spam folder

**Issue: Speech test fails**
- Solution: Check browser console for errors
- Verify AssemblyAI key is set correctly in Vercel
- Check AssemblyAI dashboard for quota

**Issue: Data not saving**
- Solution: Check Supabase logs (Logs → Postgres Logs)
- Verify RLS policies are active
- Check browser console for errors

## Part 5: Invite Beta Testers

### Create Testing Instructions

Share this with your testers:

```
# Cerebro Beta Testing Guide

Thanks for testing Cerebro! Here's how to get started:

## What is Cerebro?
Privacy-first cognitive self-tracking tool that measures:
- Reaction time (how fast you respond to visual stimuli)
- Speech timing (words per minute, pauses)
- Memory recall (short-term word memory)

## How to Test

1. **Sign Up**: Visit [YOUR-VERCEL-URL]
2. **Complete Session**: Takes ~4-6 minutes
   - Memorize words (10 seconds)
   - Reaction time test (5 trials)
   - Recall words from memory
   - Read passage aloud
3. **View Results**: Dashboard shows your performance score
4. **Repeat Weekly**: Complete 1 session per week to track trends

## What to Test

- [ ] Sign up process
- [ ] Complete at least 2 full sessions
- [ ] View dashboard and history
- [ ] Try all 3 color themes (Settings)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile (if possible)

## Report Issues

- Screenshot + description to: [YOUR-EMAIL]
- Include: Browser, device, what happened
```

### Monitor Your Deployment

**Vercel Dashboard** - Check:
- Deployments → View function logs
- Analytics → Page views, errors
- Speed Insights → Performance

**Supabase Dashboard** - Check:
- Database → Table Editor → Row counts
- Logs → Postgres Logs → Errors
- Authentication → Users → New signups

**AssemblyAI Dashboard** - Check:
- Usage → Hours used (don't exceed 5 hours/month on free tier)

## Part 6: Scaling Considerations

### Free Tier Limits

**Supabase Free Tier:**
- 500 MB database space
- 50K monthly active users
- 2 GB file storage
- 5 GB bandwidth

**Vercel Free Tier:**
- 100 GB bandwidth
- Unlimited projects
- 6000 build minutes/month

**AssemblyAI Free Tier:**
- 5 hours transcription/month
- ~300 test sessions (assuming 60 seconds each)

### When to Upgrade

- **50+ active users**: Consider Supabase Pro ($25/month)
- **300+ sessions/month**: Upgrade AssemblyAI ($0.25/hour)
- **High traffic**: Vercel Pro ($20/month)

### Cost Estimates for 100 Beta Users

Assuming 1 session/week per user:
- Supabase: Free (well within limits)
- Vercel: Free (hosting)
- AssemblyAI: ~$10/month (400 sessions × 60s = 6.7 hours)

**Total: ~$10/month**

## Part 7: Post-Launch Monitoring

### Daily Checks (Week 1)
- [ ] Check Vercel deployment status
- [ ] Review Supabase error logs
- [ ] Monitor AssemblyAI usage
- [ ] Check for user signup issues

### Weekly Checks
- [ ] Review user feedback
- [ ] Check database size (Supabase → Database → Database Settings)
- [ ] Monitor API usage
- [ ] Review error logs

### Analytics to Track
- Total signups
- Sessions completed
- Drop-off points (where users quit)
- Browser/device breakdown
- Average session duration

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Reset Test Data
```sql
-- In Supabase SQL Editor
-- WARNING: Deletes ALL user data
DELETE FROM sessions WHERE user_id IN (
  SELECT id FROM user_profiles WHERE email LIKE '%test%'
);
```

### View Recent Errors
Supabase → Logs → Postgres Logs
- Filter by: Level = Error
- Time range: Last 1 hour

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] Supabase RLS policies active on all tables
- [ ] API keys kept secret (not in GitHub)
- [ ] Redirect URLs configured correctly
- [ ] HTTPS only (Vercel provides this automatically)

## Next Steps After Beta Testing

1. Collect feedback from testers
2. Fix critical bugs
3. Add analytics (e.g., Vercel Analytics, PostHog)
4. Set up error tracking (e.g., Sentry)
5. Create feedback form
6. Plan production launch

---

## Quick Reference

**Your Production URLs:**
- App: `https://cerebro-xxxxx.vercel.app`
- Supabase: `https://xxxxx.supabase.co`
- Vercel Dashboard: `https://vercel.com/dashboard`
- Supabase Dashboard: `https://supabase.com/dashboard`

**Support Resources:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- AssemblyAI Docs: https://www.assemblyai.com/docs

Good luck with your beta launch! 🚀
