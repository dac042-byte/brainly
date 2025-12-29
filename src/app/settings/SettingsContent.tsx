'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useTheme } from '@/components/ThemeProvider'

interface SettingsContentProps {
  profile: UserProfile
  user: User
}

export function SettingsContent({ profile, user }: SettingsContentProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [audioStorageEnabled, setAudioStorageEnabled] = useState(profile.audio_storage_enabled)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSavePrivacy = async () => {
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ audio_storage_enabled: audioStorageEnabled })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully' })
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DashboardLayout>
      <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Manage your account preferences
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl p-4 ${
            message.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 text-red-900 dark:text-red-200'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-500/30 text-green-900 dark:text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-750 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Account Created
                </label>
                <input
                  type="text"
                  value={new Date(profile.created_at).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-750 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-slate-750">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-all"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Switch between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                {theme === 'light' ? (
                  <>
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    <span className="text-gray-900 font-medium">Dark</span>
                  </>
                ) : (
                  <>
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
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-gray-100 font-medium">Light</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Audio Storage
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Store audio recordings from speech tests. When disabled, only timing metrics are saved.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={audioStorageEnabled}
                    onChange={(e) => setAudioStorageEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-600/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-200 peer-checked:bg-rose-700"></div>
                </label>
              </div>
              <button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-rose-900/20 hover:shadow-rose-900/30 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>

          {/* Data Section */}
          <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Data
            </h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-slate-400">
              <p>• All data is stored securely and is only accessible by you</p>
              <p>• Measurements are compared only to your personal baseline</p>
              <p>• No data is shared with third parties</p>
              <p>• You can view all your past sessions in the History page</p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-slate-400">
              <p><strong className="text-gray-900 dark:text-white">Cogna</strong></p>
              <p>Privacy-first cognitive self-tracking</p>
              <p className="text-xs pt-2 text-gray-500 dark:text-slate-500">For personal tracking only. Not a medical device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
