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
      <div className="text-center max-w-md px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-xl hover:from-rose-700 hover:to-rose-600 transition-all shadow-lg shadow-rose-900/30"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
