'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useTheme()

  const toggleTheme = () => {
    const schemes = ['calm-analytical', 'deep-forest', 'night-sky'] as const
    const currentIndex = schemes.indexOf(colorScheme)
    const nextIndex = (currentIndex + 1) % schemes.length
    setColorScheme(schemes[nextIndex])
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      aria-label="Toggle color scheme"
      title={`Current: ${colorScheme}`}
    >
      <svg
        className="w-5 h-5 text-gray-300"
        fill="none"
        strokeWidth="2"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    </button>
  )
}
