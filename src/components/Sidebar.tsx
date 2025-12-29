'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Mission', path: '/mission' },
    { name: 'History', path: '/history' },
    { name: 'Settings', path: '/settings' },
  ]

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 min-h-screen bg-slate-900 backdrop-blur-xl border-r border-slate-750/50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-400 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Cogna Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cogna</h1>
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
            onClick={() => setIsOpen(false)}
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
        <div className="border-t border-slate-750 pt-4 space-y-3">
          <p className="text-xs text-gray-300 leading-relaxed">
            <strong className="text-slate-300">Not a medical device.</strong><br />
            Cogna is for performance monitoring and trend awareness only.
          </p>
          <div className="flex gap-4 text-xs">
            <a href="/privacy" className="text-slate-500 hover:text-slate-400 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-slate-500 hover:text-slate-400 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
