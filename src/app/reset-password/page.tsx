'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const router = useRouter()

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError })
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage({ type: 'error', text: 'Error updating password. Please try again.' })
      setLoading(false)
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' })
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4">
      <div className="w-full max-w-md bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-slate-400 text-sm">
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={8}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(15_23_42_/_0.5)]"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(15_23_42_/_0.5)]"
              required
            />
          </div>

          <div className="bg-slate-900/50 border border-slate-750 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">Password must contain:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li className={password.length >= 8 ? 'text-green-400' : ''}>
                • At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                • One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
                • One lowercase letter
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                • One number
              </li>
            </ul>
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
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
