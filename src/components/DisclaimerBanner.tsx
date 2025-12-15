'use client'

import { ThemeToggle } from './ThemeToggle'

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1"></div>
        <p className="text-sm text-amber-900 dark:text-amber-200 font-medium text-center flex-1">
          Not a medical device. No diagnosis.
        </p>
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
