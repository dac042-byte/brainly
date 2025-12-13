# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Project name: braingauge-mvp
   - Database password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait 2-3 minutes for project to initialize

## 3. Run Database Migration

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Verify success message

## 4. Get API Credentials

1. In Supabase dashboard, go to Settings → API
2. Copy:
   - Project URL (under "Project API")
   - anon/public key (under "Project API keys")

## 5. Configure Environment

1. Copy template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 6. Configure Auth URLs

1. In Supabase dashboard, go to Authentication → URL Configuration
2. Add Site URL:
   ```
   http://localhost:3000
   ```
3. Add Redirect URLs:
   ```
   http://localhost:3000/auth/callback
   ```

## 7. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 8. Test the App

1. Click "Sign up"
2. Enter email and password
3. Accept consent checkbox
4. Click "Create Account"
5. Complete first session:
   - Reaction time test (2 practice + 10 measured)
   - Speech recording (10-15 seconds)
6. View dashboard

## Optional: Audio Storage Setup

If you want to enable audio storage:

1. In Supabase dashboard, go to Storage
2. Click "New Bucket"
3. Name: `audio-recordings`
4. Keep it Private
5. Create bucket
6. Add policies in SQL Editor:

```sql
-- Allow users to upload their own audio
CREATE POLICY "Users can upload own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own audio
CREATE POLICY "Users can read own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Troubleshooting

### "Failed to fetch" errors
- Check Supabase project is running
- Verify `.env.local` credentials are correct
- Check browser console for details

### Database errors
- Ensure migration ran successfully
- Check Supabase logs in Dashboard → Logs

### Auth not working
- Verify redirect URLs in Supabase dashboard
- Check email provider is enabled
- Clear cookies and try again

### Speech recording fails
- Grant microphone permissions
- Try Chrome or Edge browser
- Can skip speech test if needed

## Production Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Update Supabase redirect URLs to production domain

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Update Supabase URLs

In Supabase → Authentication → URL Configuration:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/auth/callback`

## Next Steps

1. Complete 3 sessions to establish baseline
2. Continue weekly sessions to track trends
3. Review dashboard for personal tracking
4. (Optional) Implement real speech analysis

---

For detailed information, see README.md
