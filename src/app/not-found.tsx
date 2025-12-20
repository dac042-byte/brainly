export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-8">Page not found</p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all shadow-lg shadow-rose-900/30"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  )
}
