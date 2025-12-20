'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [audioStorageEnabled, setAudioStorageEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consentAccepted) {
      setMessage({ type: 'error', text: 'Please accept the consent to continue' })
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError })
      return
    }

    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setMessage({ type: 'error', text: authError.message })
      setLoading(false)
      return
    }

    if (authData.user) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const userLocale = navigator.language || 'en-US'

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          consent_version: 'v1.0',
          consent_timestamp: new Date().toISOString(),
          timezone: userTimezone,
          locale: userLocale,
          audio_storage_enabled: audioStorageEnabled,
        })

      if (profileError) {
        setMessage({ type: 'error', text: 'Account created but profile setup failed. Please contact support.' })
        setLoading(false)
        return
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSignup}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-t-md focus:outline-none focus:ring-1 focus:ring-rose-600 focus:border-rose-600 focus:z-10 sm:text-sm bg-white transition-all duration-200"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-b-md focus:outline-none focus:ring-1 focus:ring-rose-600 focus:border-rose-600 focus:z-10 sm:text-sm bg-white transition-all duration-200"
            placeholder="Password (min 8 characters)"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="consent" className="font-medium text-slate-300">
              I agree to use this for personal tracking only
            </label>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="audio-storage"
              name="audio-storage"
              type="checkbox"
              checked={audioStorageEnabled}
              onChange={(e) => setAudioStorageEnabled(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="audio-storage" className="font-medium text-slate-300">
              Store audio recordings (optional, not recommended)
            </label>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl p-4 border animate-slide-up ${
          message.type === 'error' ? 'bg-status-concern/10 border-status-concern/30' : 'bg-status-stable/10 border-status-stable/30'
        }`}>
          <p className={`text-sm ${
            message.type === 'error' ? 'text-status-concern' : 'text-status-stable'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || !consentAccepted}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-rose-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/30 transition-all duration-200"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>

      <div className="text-center">
        <a
          href="/login"
          className="font-medium text-rose-500 hover:text-rose-400 transition-colors duration-200"
        >
          Already have an account? Sign in
        </a>
      </div>
    </form>
  )
}
