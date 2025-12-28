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
  const { colorScheme, setColorScheme } = useTheme()
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-400">
            Manage your account preferences
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl p-4 ${
            message.type === 'error'
              ? 'bg-red-900/20 border border-red-500/30 text-red-200'
              : 'bg-green-900/20 border border-green-500/30 text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-750 rounded-lg bg-slate-800/50 text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Account Created
                </label>
                <input
                  type="text"
                  value={new Date(profile.created_at).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border border-slate-750 rounded-lg bg-slate-800/50 text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="pt-4 border-t border-slate-750">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 rounded-xl border border-red-500/30 bg-red-900/20 hover:bg-red-900/30 font-medium text-red-300 hover:text-red-200 transition-all"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Themes Section */}
          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Color Scheme
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Choose your preferred color scheme for the interface
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Calm Analytical */}
              <button
                onClick={() => setColorScheme('calm-analytical')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                  colorScheme === 'calm-analytical'
                    ? 'border-rose-600 bg-rose-900/20'
                    : 'border-slate-750 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Calm Analytical</h3>
                  {colorScheme === 'calm-analytical' && (
                    <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Slate blue with muted rose accents</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#0f1419] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#1a2129] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#8b4f6a] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#4fa3a3] border border-slate-700"></div>
                </div>
              </button>

              {/* Deep Forest */}
              <button
                onClick={() => setColorScheme('deep-forest')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                  colorScheme === 'deep-forest'
                    ? 'border-[#5d8a5d] bg-[#5d8a5d]/20'
                    : 'border-slate-750 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Deep Forest</h3>
                  {colorScheme === 'deep-forest' && (
                    <div className="w-5 h-5 rounded-full bg-[#5d8a5d] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Dark green with earth tones</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#0d1410] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#1a2420] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#4a6b4a] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#7aa67a] border border-slate-700"></div>
                </div>
              </button>

              {/* Night Sky */}
              <button
                onClick={() => setColorScheme('night-sky')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                  colorScheme === 'night-sky'
                    ? 'border-[#7563b3] bg-[#7563b3]/20'
                    : 'border-slate-750 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Night Sky</h3>
                  {colorScheme === 'night-sky' && (
                    <div className="w-5 h-5 rounded-full bg-[#7563b3] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Deep blue with soft violet</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#0a0d1a] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#151a2e] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#5a4f8b] border border-slate-700"></div>
                  <div className="w-8 h-8 rounded-md bg-[#6b8bb8] border border-slate-700"></div>
                </div>
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Theme changes apply immediately and are saved automatically
            </p>
          </div>

          {/* Privacy Section */}
          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">
                    Audio Storage
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
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
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-600/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-200 peer-checked:bg-rose-700"></div>
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
          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Your Data
            </h2>
            <div className="space-y-3 text-sm text-slate-400">
              <p>• All data is stored securely and is only accessible by you</p>
              <p>• Measurements are compared only to your personal baseline</p>
              <p>• No data is shared with third parties</p>
              <p>• You can view all your past sessions in the History page</p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p><strong className="text-white">Cogna</strong></p>
              <p>Privacy-first cognitive self-tracking</p>
              <p className="text-xs pt-2 text-slate-500">For personal tracking only. Not a medical device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
