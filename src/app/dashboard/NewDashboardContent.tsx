'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardData, UserProfile } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/DashboardLayout'

interface DashboardContentProps {
  data: DashboardData
  profile: UserProfile
}

interface UserStreak {
  current_streak: number
  longest_streak: number
  last_test_date: string | null
}

export function NewDashboardContent({ data, profile }: DashboardContentProps) {
  const router = useRouter()
  const { sessions, baseline, latestSession } = data
  const [streak, setStreak] = useState<UserStreak | null>(null)

  useEffect(() => {
    const fetchStreak = async () => {
      const supabase = createClient()
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .single()

      if (streakData) {
        setStreak(streakData)
      }
    }

    fetchStreak()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const chartData = sessions
    .slice(-8) // Last 8 sessions
    .reverse() // Reverse to show oldest on left, newest on right
    .map((session, index) => {
      const reactionMetric = session.reaction_metrics?.[0]
      const speechMetric = session.speech_metrics?.[0]
      const memoryTest = session.memory_tests?.[0]

      return {
        week: `W${index + 1}`,
        reactionTime: reactionMetric ? Number(reactionMetric.median_rt_ms) : null,
        speechActivity: speechMetric ? Number(speechMetric.speech_activity_ratio) * 100 : null,
        memoryScore: memoryTest ? (memoryTest.score / memoryTest.total_words) * 100 : null,
      }
    })

  const latestReactionMetric = latestSession?.reaction_metrics?.[0]
  const latestSpeechMetric = latestSession?.speech_metrics?.[0]
  const latestMemoryTest = latestSession?.memory_tests?.[0]
  const latestDelta = latestSession?.session_deltas?.[0]

  const getStatusBadge = (deltaPct: number | null | undefined) => {
    if (deltaPct === null || deltaPct === undefined) return { label: 'baseline', color: 'bg-teal-500/20 text-teal-400' }
    if (Math.abs(deltaPct) < 5) return { label: 'stable', color: 'bg-status-stable/20 text-status-stable' }
    if (deltaPct > 0) return { label: 'watch', color: 'bg-status-watch/20 text-status-watch' }
    return { label: 'improved', color: 'bg-status-stable/20 text-status-stable' }
  }

  const reactionStatus = getStatusBadge(latestDelta?.reaction_median_delta_pct)
  const speechStatus = getStatusBadge(latestDelta?.speech_activity_delta_pct)

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6 lg:mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                {baseline
                  ? 'Performance metrics compared to your baseline.'
                  : 'Complete 1 session to establish your baseline.'}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push('/session')}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white text-sm sm:text-base font-medium rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/30 transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
              >
                Start Session
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm sm:text-base rounded-xl transition-all duration-200 whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Empty State - No Sessions */}
        {sessions.length === 0 && (
          <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 shadow-sm p-12 text-center animate-slide-up">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Sessions Yet</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
                Start your first cognitive assessment to track your performance over time.
                Each session measures reaction time, speech patterns, and memory recall.
              </p>
              <button
                onClick={() => router.push('/session')}
                className="px-8 py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all shadow-lg shadow-rose-900/30 font-medium"
              >
                Start First Session
              </button>
            </div>
          </div>
        )}

        {/* Weekly Streak */}
        {sessions.length > 0 && streak && (
          <div className="bg-gradient-to-r from-rose-900/40 to-rose-900/30 backdrop-blur-xl rounded-2xl border border-rose-700/30 p-4 sm:p-6 mb-4 sm:mb-6 hover:border-rose-700/40 transition-all duration-300 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">Weekly Streak</h3>
                <p className="text-rose-300/80 text-xs sm:text-sm">
                  Test once per week to maintain your streak
                </p>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-rose-400 animate-count-up">{streak.current_streak}</div>
                  <div className="text-xs text-rose-300/60 mt-1">Current</div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-rose-700/30"></div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-rose-400 animate-count-up">{streak.longest_streak}</div>
                  <div className="text-xs text-rose-300/60 mt-1">Best</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {sessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content - 2 columns on desktop, full width on mobile */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Performance Score */}
            {baseline && (
              <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 shadow-sm p-4 sm:p-6 hover:border-slate-750/70 transition-all duration-300 animate-slide-up">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Performance Metrics</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {latestReactionMetric && (
                    <div className="bg-rose-900/20 rounded-xl p-3 sm:p-4 border border-rose-700/30">
                      <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                        <span className="text-3xl sm:text-4xl font-bold text-rose-400">
                          {Number(latestReactionMetric.median_rt_ms).toFixed(0)}
                        </span>
                        <span className="text-xs sm:text-sm text-rose-400">ms</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-rose-400">Reaction Time</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${reactionStatus.color}`}>
                          {reactionStatus.label}
                        </span>
                      </div>
                    </div>
                  )}

                  {latestSpeechMetric && (
                    <div className="bg-blue-900/20 rounded-xl p-3 sm:p-4 border border-blue-500/20">
                      <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                        <span className="text-3xl sm:text-4xl font-bold text-blue-300">
                          {Number(latestSpeechMetric.words_per_minute || 0).toFixed(0)}
                        </span>
                        <span className="text-xs sm:text-sm text-blue-400">wpm</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-blue-400">Speech</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${speechStatus.color}`}>
                          {speechStatus.label}
                        </span>
                      </div>
                    </div>
                  )}

                  {latestMemoryTest && (
                    <div className="bg-teal-900/20 rounded-xl p-3 sm:p-4 border border-teal-500/20">
                      <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                        <span className="text-3xl sm:text-4xl font-bold text-teal-300">
                          {latestMemoryTest.total_words > 0
                            ? ((latestMemoryTest.score / latestMemoryTest.total_words) * 100).toFixed(0)
                            : '0'}
                        </span>
                        <span className="text-xs sm:text-sm text-teal-400">%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-teal-400">Memory Recall</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Banner */}
            {!baseline && sessions.length < 1 && (
              <div className="bg-gradient-to-r from-rose-900/40 to-rose-900/30 backdrop-blur-xl rounded-2xl border border-rose-700/30 p-6 hover:border-rose-700/40 transition-all duration-300 animate-slide-up">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Building Your Baseline</h3>
                <p className="text-rose-300">
                  Complete {1 - sessions.length} more session{1 - sessions.length > 1 ? 's' : ''} to establish your personal baseline.
                </p>
              </div>
            )}

            {/* History Chart */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 shadow-sm p-4 sm:p-6 hover:border-slate-750/70 transition-all duration-300 animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Performance Trends</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Last 8 sessions</p>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-gray-600 dark:text-slate-400">Reaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-gray-600 dark:text-slate-400">Speech</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                      <span className="text-gray-600 dark:text-slate-400">Memory</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200} className="sm:hidden">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3945" opacity={0.25} />
                    <XAxis
                      dataKey="week"
                      stroke="#4a5a6a"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#4a5a6a"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      domain={[0, 100]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#4a5a6a"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      domain={['dataMin - 20', 'dataMax + 20']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2129',
                        border: '1px solid #2a3945',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="reactionTime"
                      name="Reaction Time"
                      stroke="#a86382"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="speechActivity"
                      name="Speech"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="memoryScore"
                      name="Memory"
                      stroke="#5eead4"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={250} className="hidden sm:block">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3945" opacity={0.25} />
                    <XAxis
                      dataKey="week"
                      stroke="#4a5a6a"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#4a5a6a"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      domain={[0, 100]}
                      label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#4a5a6a"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      domain={['dataMin - 20', 'dataMax + 20']}
                      label={{ value: 'Reaction Time (ms)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2129',
                        border: '1px solid #2a3945',
                        borderRadius: '12px',
                        color: '#e2e8f0'
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="reactionTime"
                      name="Reaction Time"
                      stroke="#a86382"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#a86382', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#c2789a' }}
                      connectNulls
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="speechActivity"
                      name="Speech Activity"
                      stroke="#60a5fa"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#93c5fd' }}
                      connectNulls
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="memoryScore"
                      name="Memory Score"
                      stroke="#5eead4"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#5eead4', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#99f6e4' }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>

                {baseline && (
                  <div className="mt-4 pt-4 border-t border-slate-750">
                    <div className="bg-teal-600/10 border border-teal-600/20 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">Trend Summary</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Category</p>
                          <p className="text-slate-300">Reaction</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">This Week</p>
                          <p className="text-white font-semibold">
                            {latestReactionMetric ? Number(latestReactionMetric.median_rt_ms).toFixed(0) : '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Δ</p>
                          <p className={`font-semibold ${
                            (latestDelta?.reaction_median_delta_pct || 0) > 0
                              ? 'text-amber-400'
                              : 'text-teal-400'
                          }`}>
                            {latestDelta?.reaction_median_delta_pct
                              ? `${latestDelta.reaction_median_delta_pct > 0 ? '+' : ''}${Number(latestDelta.reaction_median_delta_pct).toFixed(1)}%`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* This Week's Plan */}
            <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 shadow-sm p-6 hover:border-slate-750/70 transition-all duration-300 animate-slide-up">
              <h2 className="text-lg font-bold text-white mb-3">This Week's Plan</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                Complete your session to track your cognitive performance.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors duration-200">
                  <h3 className="text-sm font-semibold text-white mb-3">Weekly Check-In</h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-4">
                    ~1-2 minutes total. Try to do it at the same time of day.
                  </p>

                  <button
                    onClick={() => router.push('/session')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-medium rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/30 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Start Check-In
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {sessions.length > 0 && (
              <div className="bg-white dark:bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-750/50 shadow-sm p-6 hover:border-slate-750/70 transition-all duration-300 animate-slide-up">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Total Sessions</span>
                    <span className="text-white font-semibold">{sessions.length}</span>
                  </div>
                  {baseline && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Baseline RT</span>
                      <span className="text-white font-semibold">
                        {Number(baseline.baseline_median_rt_ms).toFixed(0)}ms
                      </span>
                    </div>
                  )}
                  {latestSession && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Last Session</span>
                      <span className="text-white font-semibold">
                        {format(new Date(latestSession.created_at), 'MMM d')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  )
}
