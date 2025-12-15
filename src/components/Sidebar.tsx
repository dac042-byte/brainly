'use client'

import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'History', path: '/history', icon: '📈' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  return (
    <div className="w-80 min-h-screen bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BrainGauge</h1>
            <p className="text-xs text-gray-400">Performance tracker</p>
          </div>
        </div>

        <div className="mt-4 px-3 py-2 bg-pink-500/20 rounded-lg border border-pink-500/30">
          <p className="text-xs text-pink-300 font-medium">✓ Baseline established</p>
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
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/50'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </a>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-6">
        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Not a medical device.</strong><br />
            BrainGauge is for performance monitoring and trend awareness only.
          </p>
        </div>
      </div>
    </div>
  )
}
