'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage({ type: 'error', text: 'Error sending reset email. Please try again.' })
    } else {
      setMessage({
        type: 'success',
        text: 'Check your email for a password reset link.'
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4">
      <div className="w-full max-w-md bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400 text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(15_23_42_/_0.5)]"
              required
            />
          </div>

          {message && (
            <div className={`rounded-xl p-4 border ${
              message.type === 'error'
                ? 'bg-red-900/20 border-red-700/30 text-red-300'
                : 'bg-green-900/20 border-green-700/30 text-green-300'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-medium rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
