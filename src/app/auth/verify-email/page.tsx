'use client'

import Link from 'next/link'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4">
      <div className="max-w-md w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-slate-400 mb-6">
            We've sent you a verification link. Please check your email and click the link to verify your account.
          </p>

          <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-rose-300">
              <strong>Important:</strong> You must verify your email before you can log in.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
            <Link
              href="/login"
              className="block w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-700 hover:to-rose-600 text-white font-medium rounded-xl transition-all duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
