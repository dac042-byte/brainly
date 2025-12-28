'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link' })
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setUseMagicLink(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            !useMagicLink
              ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md shadow-rose-900/30'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => setUseMagicLink(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            useMagicLink
              ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md shadow-rose-900/30'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Magic Link
        </button>
      </div>

      <form className="mt-8 space-y-6" onSubmit={useMagicLink ? handleMagicLinkLogin : handleEmailPasswordLogin}>
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
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-t-md focus:outline-none focus:ring-1 focus:ring-rose-600 focus:border-rose-600 focus:z-10 sm:text-sm bg-white transition-all duration-200 [-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]"
              placeholder="Email address"
            />
          </div>
          {!useMagicLink && (
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-b-md focus:outline-none focus:ring-1 focus:ring-rose-600 focus:border-rose-600 focus:z-10 sm:text-sm bg-white transition-all duration-200 [-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]"
                placeholder="Password"
              />
            </div>
          )}
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
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-rose-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/30 transition-all duration-200"
          >
            {loading ? 'Loading...' : useMagicLink ? 'Send Magic Link' : 'Sign In'}
          </button>
        </div>

        <div className="text-center space-y-2">
          <div>
            <a
              href="/forgot-password"
              className="text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>
          <div>
            <a
              href="/signup"
              className="font-medium text-rose-500 hover:text-rose-400 transition-colors duration-200"
            >
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}
