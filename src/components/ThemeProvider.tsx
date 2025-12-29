'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ColorScheme = 'calm-analytical' | 'deep-forest' | 'night-sky'

interface ThemeContextType {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('calm-analytical')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('cerebro-color-scheme') as ColorScheme | null
    if (stored) {
      setColorSchemeState(stored)
      document.documentElement.setAttribute('data-color-scheme', stored)
    } else {
      document.documentElement.setAttribute('data-color-scheme', 'calm-analytical')
    }
  }, [])

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme)
    localStorage.setItem('cerebro-color-scheme', scheme)
    document.documentElement.setAttribute('data-color-scheme', scheme)
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    return {
      colorScheme: 'calm-analytical' as ColorScheme,
      setColorScheme: () => {},
    }
  }
  return context
}
