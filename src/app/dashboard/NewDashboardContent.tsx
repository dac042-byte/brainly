'use client'

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

export function NewDashboardContent({ data, profile }: DashboardContentProps) {
  const router = useRouter()
  const { sessions, baseline, latestSession } = data

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const reactionTimeData = sessions
    .filter(s => s.reaction_metrics && s.reaction_metrics.length > 0)
    .reverse()
    .slice(-8) // Last 8 sessions
    .map((session, index) => {
      const metric = session.reaction_metrics![0]
      return {
        week: `W${index + 1}`,
        reactionTime: Number(metric.median_rt_ms),
      }
    })

  const latestReactionMetric = latestSession?.reaction_metrics?.[0]
  const latestSpeechMetric = latestSession?.speech_metrics?.[0]
  const latestDelta = latestSession?.session_deltas?.[0]

  // Calculate performance score (0-100)
  const performanceScore = baseline && latestReactionMetric
    ? Math.max(0, Math.min(100, 100 - (Number(latestDelta?.reaction_median_delta_pct) || 0) * 2))
    : 50

  const getStatusBadge = (deltaPct: number | null | undefined) => {
    if (deltaPct === null || deltaPct === undefined) return { label: 'baseline', color: 'bg-gray-500/20 text-gray-300' }
    if (Math.abs(deltaPct) < 5) return { label: 'stable', color: 'bg-teal-500/20 text-teal-300' }
    if (deltaPct > 0) return { label: 'watch', color: 'bg-amber-500/20 text-amber-300' }
    return { label: 'improved', color: 'bg-green-500/20 text-green-300' }
  }

  const reactionStatus = getStatusBadge(latestDelta?.reaction_median_delta_pct)
  const speechStatus = getStatusBadge(latestDelta?.speech_activity_delta_pct)

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">
                {baseline
                  ? 'Performance metrics compared to your baseline.'
                  : 'Complete 3 sessions to establish your baseline.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/session')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
              >
                Start This Week
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Performance Score */}
            {baseline && (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Performance Score</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Weighted average of reaction time and speech metrics. Higher = better performance.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-white">{Math.round(performanceScore)}</span>
                      <span className="text-sm text-gray-400">/ 100</span>
                    </div>
                    <p className="text-xs text-gray-500">Overall</p>
                  </div>

                  {latestReactionMetric && (
                    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-bold text-purple-300">
                          {Number(latestReactionMetric.median_rt_ms).toFixed(0)}
                        </span>
                        <span className="text-sm text-purple-400">ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-400">Reaction</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reactionStatus.color}`}>
                          {reactionStatus.label}
                        </span>
                      </div>
                    </div>
                  )}

                  {latestSpeechMetric && (
                    <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-bold text-blue-300">
                          {(Number(latestSpeechMetric.speech_activity_ratio) * 100).toFixed(0)}
                        </span>
                        <span className="text-sm text-blue-400">%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-400">Speech</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${speechStatus.color}`}>
                          {speechStatus.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Banner */}
            {!baseline && sessions.length < 3 && (
              <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
                <h3 className="text-lg font-bold text-white mb-2">Building Your Baseline</h3>
                <p className="text-indigo-200">
                  Complete {3 - sessions.length} more session{3 - sessions.length > 1 ? 's' : ''} to establish your personal baseline.
                </p>
              </div>
            )}

            {/* History Chart */}
            {reactionTimeData.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">History</h2>
                    <p className="text-sm text-gray-400">Last 8 weeks (mock data)</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-gray-400">Reaction Time</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={reactionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="week"
                      stroke="#6B7280"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      domain={['dataMin - 20', 'dataMax + 20']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reactionTime"
                      stroke="#A78BFA"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#A78BFA' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {baseline && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Trend Summary</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Category</p>
                          <p className="text-gray-300">Reaction</p>
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
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
              <h2 className="text-lg font-bold text-white mb-3">This Week's Plan</h2>
              <p className="text-sm text-gray-400 mb-6">
                Complete your session to track your cognitive performance.
              </p>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Weekly Check-In</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    ~4-6 minutes total. Try to do it at the same time of day.
                  </p>

                  <div className="space-y-2 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span>Quiet room</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span>Good lighting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span>Camera ready</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/session')}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all"
                  >
                    Start Check-In
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {sessions.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Quick Stats</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Sessions</span>
                    <span className="text-white font-semibold">{sessions.length}</span>
                  </div>
                  {baseline && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Baseline RT</span>
                      <span className="text-white font-semibold">
                        {Number(baseline.baseline_median_rt_ms).toFixed(0)}ms
                      </span>
                    </div>
                  )}
                  {latestSession && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Last Session</span>
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
      </div>
    </DashboardLayout>
  )
}
