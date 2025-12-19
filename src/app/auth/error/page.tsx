'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const errorMessages: Record<string, string> = {
    verification_failed: 'Email verification failed. The link may have expired.',
    invalid_credentials: 'Invalid email or password.',
    email_not_confirmed: 'Please verify your email before logging in.',
    unknown: 'An error occurred during authentication.',
  }

  const displayMessage = message ? errorMessages[message] || errorMessages.unknown : errorMessages.unknown

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4">
      <div className="max-w-md w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
          <p className="text-slate-400 mb-6">{displayMessage}</p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-4 py-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-medium rounded-xl transition-all duration-200"
            >
              Go to Login
            </Link>
            <Link
              href="/signup"
              className="block w-full px-4 py-3 border border-slate-750 hover:bg-slate-800/50 text-slate-300 font-medium rounded-xl transition-all duration-200"
            >
              Sign Up Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
