# Production Launch Guide for Cerebro

## CRITICAL - Must Complete Before Launch

### 1. Environment Variables Security

**Check `.gitignore`:**
```bash
# Run this to verify
cat .gitignore | grep -E "\.env|\.local"
```

Should include:
```
.env*.local
.env
```

**Action:** If missing, add them immediately and verify no `.env` files are in git history.

---

### 2. Remove Console.logs

**Find all console.logs:**
```bash
grep -r "console.log" src/
```

**Action:**
- Remove all `console.log()` statements
- Replace with proper error handling or remove entirely
- For errors you want to track, use `console.error()` (acceptable in production)

**Example Fix:**
```typescript
// BAD
console.log('User data:', userData)

// GOOD - remove it
// or for errors:
console.error('Failed to load user:', error)
```

---

### 3. Input Validation (Server-Side)

**Current Risk:** Session test inputs aren't validated server-side.

**Create validation utility:**
```typescript
// src/lib/validation.ts
export function validateSessionInput(data: any) {
  // Reaction test
  if (data.reaction_time !== undefined) {
    if (typeof data.reaction_time !== 'number' || data.reaction_time < 0 || data.reaction_time > 10000) {
      throw new Error('Invalid reaction time')
    }
  }

  // Speech test
  if (data.speech_duration !== undefined) {
    if (typeof data.speech_duration !== 'number' || data.speech_duration < 0 || data.speech_duration > 60000) {
      throw new Error('Invalid speech duration')
    }
  }

  // Memory test
  if (data.word_sequence !== undefined) {
    if (!Array.isArray(data.word_sequence) || data.word_sequence.length > 20) {
      throw new Error('Invalid word sequence')
    }
  }

  return true
}
```

**Apply in server actions** - Add validation before database inserts.

---

### 4. Rate Limiting

**Option 1: Supabase Edge Functions** (Recommended)
In Supabase Dashboard → Edge Functions, add rate limiting to auth endpoints.

**Option 2: Middleware** (Simpler for MVP)
```typescript
// src/middleware.ts additions
import { ratelimit } from '@/lib/ratelimit'

// Add rate limiting to sensitive routes
if (request.nextUrl.pathname.startsWith('/api/')) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }
}
```

**Create rate limiter:**
```typescript
// src/lib/ratelimit.ts
// Using Upstash Redis (free tier available) or simple in-memory for MVP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export const ratelimit = {
  limit: async (identifier: string) => {
    const now = Date.now()
    const limit = 10 // requests
    const window = 60000 // per minute

    const record = rateLimitMap.get(identifier)

    if (!record || record.resetAt < now) {
      rateLimitMap.set(identifier, { count: 1, resetAt: now + window })
      return { success: true }
    }

    if (record.count >= limit) {
      return { success: false }
    }

    record.count++
    return { success: true }
  }
}
```

---

### 5. Verify RLS Policies on Supabase

**Go to Supabase Dashboard → Table Editor**

For each table, verify these policies exist:

**`user_profiles`:**
```sql
-- SELECT policy
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- INSERT policy
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE policy
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);
```

**`sessions`:**
```sql
-- SELECT policy
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own sessions"
ON sessions FOR UPDATE
USING (auth.uid() = user_id);
```

**Apply same pattern to:**
- `reaction_metrics`
- `speech_metrics`
- `memory_tests`
- `session_deltas`
- `baseline_tracking`

---

### 6. Error Boundaries

**Create error boundary component:**
```typescript
// src/components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Wrap your app layout:**
```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

### 7. Empty States

**Dashboard with no sessions:**
```typescript
// In NewDashboardContent.tsx, add:
{sessions.length === 0 && (
  <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-12 text-center">
    <h3 className="text-xl font-bold text-white mb-4">No Sessions Yet</h3>
    <p className="text-slate-400 mb-6">
      Start your first cognitive assessment to track your performance over time.
    </p>
    <a
      href="/session"
      className="inline-block px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all"
    >
      Start First Session
    </a>
  </div>
)}
```

---

### 8. File Upload Validation (Audio)

**If you're storing audio files:**
```typescript
// src/lib/validation.ts
export function validateAudioFile(file: File) {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['audio/webm', 'audio/wav', 'audio/mp4']

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only WebM, WAV, and MP4 audio allowed.')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  return true
}
```

---

## HIGH PRIORITY - Complete Within Week 1

### 9. Supabase Redirect URLs

**In Supabase Dashboard → Authentication → URL Configuration:**

Add these URLs:

**Local Development:**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/reset-password
```

**Production:**
```
https://yourapp.vercel.app/auth/callback
https://yourapp.vercel.app/auth/confirm
https://yourapp.vercel.app/reset-password
```

---

### 10. Vercel Environment Variables

**In Vercel Dashboard → Project → Settings → Environment Variables:**

Add:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Important:**
- Copy from `.env.local`
- Apply to Production, Preview, and Development environments
- Redeploy after adding

---

### 11. Custom 404 Page

**Create:**
```typescript
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-8">Page not found</p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  )
}
```

---

### 12. Custom Error Page

**Create:**
```typescript
// src/app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

---

### 13. Privacy Policy & Terms

**Create basic pages:**

```typescript
// src/app/privacy/page.tsx
export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <section className="space-y-4 text-slate-300">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2 className="text-xl font-bold text-white mt-8">Data We Collect</h2>
          <p>
            Cerebro collects email addresses and cognitive test results (reaction time,
            speech metrics, memory scores). All data is stored securely and is only
            accessible by you.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">How We Use Your Data</h2>
          <p>
            Your data is used solely to provide you with cognitive performance tracking.
            We do not share, sell, or distribute your data to third parties.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Data Security</h2>
          <p>
            We use industry-standard encryption and security measures. Data is stored
            in secure databases with row-level security policies.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Your Rights</h2>
          <p>
            You can request deletion of your account and all associated data at any time
            by contacting us.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Contact</h2>
          <p>For privacy concerns, contact: [your-email]</p>
        </section>
      </div>
    </div>
  )
}
```

```typescript
// src/app/terms/page.tsx
export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <section className="space-y-4 text-slate-300">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2 className="text-xl font-bold text-white mt-8">Not a Medical Device</h2>
          <p className="text-red-400 font-medium">
            Cerebro is NOT a medical device and is NOT intended to diagnose, treat,
            cure, or prevent any disease. This tool is for personal tracking and
            awareness only.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Intended Use</h2>
          <p>
            Cerebro is designed for personal cognitive performance tracking. It is not
            a substitute for professional medical advice, diagnosis, or treatment.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Liability</h2>
          <p>
            Use of this service is at your own risk. We are not liable for any decisions
            made based on data from this tool. Always consult qualified medical
            professionals for health-related decisions.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Acceptable Use</h2>
          <p>
            This service is for personal use only. You agree not to misuse the service
            or use it for any unlawful purpose.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Account Termination</h2>
          <p>
            We reserve the right to terminate accounts that violate these terms.
          </p>
        </section>
      </div>
    </div>
  )
}
```

**Add links to footer:**
```typescript
// Update Sidebar.tsx bottom section
<div className="p-6">
  <div className="border-t border-slate-750 pt-4">
    <p className="text-xs text-gray-500 leading-relaxed mb-2">
      <strong className="text-slate-400">Not a medical device.</strong><br />
      Cerebro is for performance monitoring and trend awareness only.
    </p>
    <div className="flex gap-4 text-xs">
      <a href="/privacy" className="text-slate-500 hover:text-slate-400">Privacy</a>
      <a href="/terms" className="text-slate-500 hover:text-slate-400">Terms</a>
    </div>
  </div>
</div>
```

---

## Launch Checklist

Before going live, verify:

- [ ] All console.logs removed from src/
- [ ] .env files not in git
- [ ] RLS policies exist for all tables
- [ ] Rate limiting configured
- [ ] Error boundary in place
- [ ] Empty states added to dashboard/history
- [ ] 404 and error pages created
- [ ] Privacy policy and terms published
- [ ] Supabase redirect URLs configured
- [ ] Vercel environment variables set
- [ ] Test signup → session → dashboard flow
- [ ] Test password reset flow
- [ ] Test on mobile device

---

## Quick Commands

**Remove console.logs:**
```bash
# Find them
grep -r "console.log" src/

# Remove manually or use sed (be careful!)
```

**Test build:**
```bash
npm run build
```

**Deploy to Vercel:**
```bash
git push origin main
# Or use Vercel CLI: vercel --prod
```

---

## After Launch Monitoring

Week 1 priorities:
1. Monitor error logs in Vercel dashboard
2. Watch for failed auth attempts
3. Check database for unusual activity
4. Test all flows from production URL
5. Get feedback from first users
