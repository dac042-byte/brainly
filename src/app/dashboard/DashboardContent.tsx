'use client'

import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardData, UserProfile } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DashboardContentProps {
  data: DashboardData
  profile: UserProfile
}

export function DashboardContent({ data, profile }: DashboardContentProps) {
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
    .map(session => {
      const metric = session.reaction_metrics![0]
      const delta = session.session_deltas?.[0]
      return {
        date: format(new Date(session.created_at), 'MMM d'),
        medianRt: Number(metric.median_rt_ms),
        deltaPct: delta?.reaction_median_delta_pct ? Number(delta.reaction_median_delta_pct) : null,
      }
    })

  const speechActivityData = sessions
    .filter(s => s.speech_metrics && s.speech_metrics.length > 0)
    .reverse()
    .map(session => {
      const metric = session.speech_metrics![0]
      const delta = session.session_deltas?.[0]
      return {
        date: format(new Date(session.created_at), 'MMM d'),
        activityRatio: Number(metric.speech_activity_ratio) * 100,
        deltaPct: delta?.speech_activity_delta_pct ? Number(delta.speech_activity_delta_pct) : null,
      }
    })

  const latestReactionMetric = latestSession?.reaction_metrics?.[0]
  const latestSpeechMetric = latestSession?.speech_metrics?.[0]
  const latestDelta = latestSession?.session_deltas?.[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-gray-300 mt-1">
            Track your cognitive performance over time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/history"
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
          >
            History
          </a>
          <a
            href="/settings"
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
          >
            Settings
          </a>
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {!baseline && sessions.length < 1 && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
            Building Your Baseline
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Complete {1 - sessions.length} more session{1 - sessions.length > 1 ? 's' : ''} to establish your personal baseline.
            Your baseline will be used to track changes over time.
          </p>
        </div>
      )}

      <div className="mb-6">
        <a
          href="/session"
          className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Run Today's Session
        </a>
      </div>

      {latestSession && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Latest Session
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            {format(new Date(latestSession.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestReactionMetric && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  Reaction Time
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Number(latestReactionMetric.median_rt_ms).toFixed(0)}ms
                    </p>
                    <p className="text-sm text-gray-300">Median</p>
                  </div>
                  {baseline && latestDelta?.reaction_median_delta_pct !== null && latestDelta?.reaction_median_delta_pct !== undefined && (
                    <div className="text-sm">
                      <span className={
                        Number(latestDelta?.reaction_median_delta_pct) > 0
                          ? 'text-gray-300'
                          : 'text-gray-300'
                      }>
                        {Number(latestDelta?.reaction_median_delta_pct) > 0 ? '+' : ''}
                        {Number(latestDelta?.reaction_median_delta_pct).toFixed(1)}% from baseline
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {latestSpeechMetric && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  Speech Activity
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {(Number(latestSpeechMetric.speech_activity_ratio) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-300">Activity Ratio</p>
                  </div>
                  {baseline && latestDelta?.speech_activity_delta_pct !== null && latestDelta?.speech_activity_delta_pct !== undefined && (
                    <div className="text-sm">
                      <span className={
                        Number(latestDelta?.speech_activity_delta_pct) > 0
                          ? 'text-gray-300'
                          : 'text-gray-300'
                      }>
                        {Number(latestDelta?.speech_activity_delta_pct) > 0 ? '+' : ''}
                        {Number(latestDelta?.speech_activity_delta_pct).toFixed(1)}% from baseline
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {reactionTimeData.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Reaction Time Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reactionTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis label={{ value: 'Milliseconds', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="medianRt"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#8b5cf6' }}
                activeDot={{ r: 7 }}
                name="Median RT"
              />
            </LineChart>
          </ResponsiveContainer>
          {baseline && (
            <p className="text-sm text-gray-300 mt-2">
              Baseline: {Number(baseline.baseline_median_rt_ms).toFixed(0)}ms
            </p>
          )}
        </div>
      )}

      {speechActivityData.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Speech Activity Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={speechActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis label={{ value: 'Activity %', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="activityRatio"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
                activeDot={{ r: 7 }}
                name="Activity Ratio"
              />
            </LineChart>
          </ResponsiveContainer>
          {baseline && baseline.baseline_speech_activity && (
            <p className="text-sm text-gray-300 mt-2">
              Baseline: {(Number(baseline.baseline_speech_activity) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-300 mb-4">
            No sessions yet. Start your first session to begin tracking.
          </p>
          <a
            href="/session"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start First Session
          </a>
        </div>
      )}
    </div>
  )
}
