# Braingauge v1 MVP

Privacy-first cognitive self-tracking web application for measuring reaction time and speech patterns against a personal baseline.

## Overview

Braingauge v1 is a web app that helps users track their cognitive performance over time through:
- **Reaction Time Tests**: Measures response latency to visual stimuli
- **Speech Recording**: Captures speech timing patterns (duration, pauses, activity ratio)
- **Personal Baseline Tracking**: All comparisons are made against the user's own baseline (first 3 sessions)

**Important**: This app does NOT provide medical advice, diagnosis, or predictions about health conditions.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, API Routes
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (Email/Password + Magic Links)
- **Charts**: Recharts
- **Deployment**: Vercel (recommended) or any Node.js host

## Features

### User Flow
1. **First-time users**: Accept disclaimer → Create account → Run baseline session
2. **Returning users**: View dashboard → Run new session → See trends vs baseline

### Tests
- **Reaction Time**: 2 practice + 10 measured trials with random delays (1-3s)
- **Speech Recording**: 10-15 seconds of read-aloud speech with optional redo
- **Session Duration**: ~2 minutes total

### Privacy
- All audio storage is optional (off by default)
- Data compared only to personal baseline (no population comparisons)
- Row-level security ensures users only access their own data

### Dashboard
- Latest session summary
- Trend charts for reaction time and speech activity
- Changes shown as percentage from personal baseline
- No diagnostic labels or health claims

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)

### 1. Clone and Install

```bash
cd brainly
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (takes ~2 minutes)
3. Note your project URL and anon key from Settings → API

### 3. Run Database Migrations

1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the migration in the SQL Editor
4. Verify tables were created in the Table Editor

### 4. Configure Storage (Optional - for audio storage)

If users want to store audio recordings:

1. In Supabase, go to Storage
2. Create a new bucket called `audio-recordings`
3. Set the bucket to private (default)
4. Add storage policy:

```sql
-- Allow authenticated users to upload their own audio
CREATE POLICY "Users can upload own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own audio
CREATE POLICY "Users can read own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Configure Supabase Auth

1. In Supabase Dashboard → Authentication → URL Configuration
2. Add your site URL (e.g., `http://localhost:3000` for local dev)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

4. In Authentication → Providers:
   - Enable Email provider
   - Configure email templates if desired

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 8. Test the Application

1. Sign up with an email and password
2. Accept the consent disclaimer
3. Complete your first session (reaction time + speech)
4. Run 2 more sessions to establish baseline
5. View your dashboard with trends

## Project Structure

```
brainly/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/
│   │   │   └── callback/       # Auth callback handler
│   │   ├── dashboard/          # Dashboard page
│   │   ├── login/              # Login page
│   │   ├── session/            # Test session page
│   │   ├── signup/             # Signup page
│   │   ├── api/
│   │   │   └── speech/
│   │   │       └── analyze/    # Speech analysis API stub
│   │   ├── layout.tsx          # Root layout with disclaimer
│   │   ├── page.tsx            # Home (redirects to dashboard)
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── DisclaimerBanner.tsx
│   │   ├── ReactionTimeTest.tsx
│   │   └── SpeechTest.tsx
│   ├── lib/
│   │   ├── actions/            # Server actions
│   │   │   ├── dashboard.ts
│   │   │   └── session.ts
│   │   ├── supabase/           # Supabase clients
│   │   │   ├── client.ts       # Browser client
│   │   │   └── server.ts       # Server client
│   │   ├── speech-analysis.ts  # Speech analysis abstraction
│   │   └── types.ts            # TypeScript types
│   └── middleware.ts           # Auth middleware
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── .env.example                # Environment variables template
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Database Schema

### Tables

- **user_profiles**: Minimal user data, consent, privacy settings
- **sessions**: Test session records
- **reaction_trials**: Per-trial reaction time data
- **reaction_metrics**: Derived metrics per session
- **speech_data**: Speech recording metadata
- **speech_metrics**: Derived speech timing metrics
- **baseline_tracking**: User baseline definitions
- **session_deltas**: Per-session change vs baseline

### Row Level Security

All tables have RLS policies ensuring users can only access their own data.

## Speech Analysis

The MVP includes a stub for speech analysis at `/api/speech/analyze`. Currently returns mock metrics:

- Voiced time
- Pause time and count
- Speech activity ratio

To implement real analysis, either:

1. **Local analysis**: Update `src/lib/speech-analysis.ts` with Web Audio API or ML library
2. **External API**: Set `SPEECH_ANALYSIS_API_URL` in `.env.local` and implement the API endpoint

The app abstracts this so switching between methods requires no UI changes.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the app:

```bash
npm run build
npm start
```

Ensure environment variables are set in your hosting platform.

## Usage Guidelines

### For Best Results

- Test at the same time of day
- Use similar environment conditions
- Complete sessions weekly
- Avoid testing when tired or distracted

### Data Interpretation

- All data compares to YOUR baseline (first 3 sessions)
- Changes indicate variation, not health status
- No diagnostic value or medical meaning
- Consult healthcare professionals for medical concerns

## Privacy & Security

- Audio storage is optional (disabled by default)
- All data is user-scoped via RLS
- No cross-user comparisons
- No medical claims or predictions
- Supabase handles authentication and data security

## Future Enhancements (Not in v1)

- Real speech analysis with VAD (Voice Activity Detection)
- Mobile app
- Export data feature
- Advanced visualization options
- Multi-language support

## Troubleshooting

### Database connection issues
- Verify `.env.local` credentials
- Check Supabase project is running
- Ensure migrations ran successfully

### Authentication issues
- Verify redirect URLs in Supabase dashboard
- Check email provider is enabled
- Clear browser cookies and try again

### Speech recording not working
- Check microphone permissions in browser
- Try different browser (Chrome/Edge recommended)
- Speech test can be skipped if needed

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Verify all environment variables are set

## License

MIT License - See LICENSE file for details

---

**Disclaimer**: This application is not a medical device and provides no information about medical conditions, cognitive health, or impairment. It is for personal self-tracking only. Consult qualified healthcare professionals for any medical concerns.
