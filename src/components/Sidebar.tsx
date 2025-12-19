'use client'

import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'History', path: '/history' },
    { name: 'Settings', path: '/settings' },
  ]

  return (
    <div className="w-80 min-h-screen bg-slate-900 backdrop-blur-xl border-r border-slate-750/50 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-700 to-rose-600 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Cerebro Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cerebro</h1>
            <p className="text-xs text-slate-400">Performance tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname === item.path
                ? 'bg-rose-700 text-white shadow-lg shadow-rose-900/50'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span className="font-medium">{item.name}</span>
          </a>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-6">
        <div className="border-t border-slate-750 pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-slate-400">Not a medical device.</strong><br />
            Cerebro is for performance monitoring and trend awareness only.
          </p>
        </div>
      </div>
    </div>
  )
}
