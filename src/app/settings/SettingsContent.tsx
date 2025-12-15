'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/types'
import { useTheme } from '@/components/ThemeProvider'
import type { User } from '@supabase/supabase-js'

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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account preferences
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Created
                </label>
                <input
                  type="text"
                  value={new Date(profile.created_at).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-md transition-all"
              >
                {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
              </button>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Audio Storage
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>

          {/* Data Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Your Data
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>• All data is stored securely and is only accessible by you</p>
              <p>• Measurements are compared only to your personal baseline</p>
              <p>• No data is shared with third parties</p>
              <p>• You can view all your past sessions in the History page</p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Braingauge v1</strong></p>
              <p>Privacy-first cognitive self-tracking</p>
              <p className="text-xs pt-2">For personal tracking only. Not a medical device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
