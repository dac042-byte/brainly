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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
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

      // Redirect to verify email page
      router.push('/auth/verify-email')
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
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-750 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
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
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-750 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
            placeholder="Password (min 6 characters)"
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
            <label htmlFor="consent" className="font-medium text-gray-700 dark:text-slate-300">
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
            <label htmlFor="audio-storage" className="font-medium text-gray-700 dark:text-slate-300">
              Store audio recordings (optional, not recommended)
            </label>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
        }`}>
          <p className={`text-sm ${
            message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || !consentAccepted}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>

      <div className="text-center">
        <a
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Already have an account? Sign in
        </a>
      </div>
    </form>
  )
}
