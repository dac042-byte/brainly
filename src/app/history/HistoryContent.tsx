'use client'

import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import type { SessionWithMetrics, BaselineTracking } from '@/lib/types'
import { DashboardLayout } from '@/components/DashboardLayout'

interface HistoryContentProps {
  sessions: SessionWithMetrics[]
  baseline: BaselineTracking | null
}

export function HistoryContent({ sessions, baseline }: HistoryContentProps) {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Session History
          </h1>
          <p className="text-gray-400">
            View all your past test results
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 text-center">
            <p className="text-gray-400 mb-4">
              No sessions yet. Complete your first session to see your history.
            </p>
            <button
              onClick={() => router.push('/session')}
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all"
            >
              Start First Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const reactionMetric = session.reaction_metrics?.[0]
              const speechMetric = session.speech_metrics?.[0]
              const delta = session.session_deltas?.[0]
              const isBaseline = baseline?.baseline_session_ids.includes(session.id)

              return (
                <div
                  key={session.id}
                  className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-gray-700/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Session #{sessions.length - index}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(session.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                    {isBaseline && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30">
                        Baseline Session
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Reaction Time */}
                    {reactionMetric && (
                      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                        <h4 className="text-sm font-medium text-purple-300 mb-2">
                          Reaction Time
                        </h4>
                        <div className="space-y-1">
                          <div>
                            <p className="text-2xl font-bold text-purple-200">
                              {Number(reactionMetric.median_rt_ms).toFixed(0)}ms
                            </p>
                            <p className="text-xs text-purple-400">Median</p>
                          </div>
                          {delta?.reaction_median_delta_pct !== null && delta?.reaction_median_delta_pct !== undefined && (
                            <p className="text-sm text-purple-300">
                              {Number(delta.reaction_median_delta_pct) > 0 ? '+' : ''}
                              {Number(delta.reaction_median_delta_pct).toFixed(1)}% from baseline
                            </p>
                          )}
                          <p className="text-xs text-purple-400 pt-1">
                            Variability: ±{Number(reactionMetric.std_dev_ms).toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Speech Activity */}
                    {speechMetric && !session.speech_skipped && (
                      <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">
                          Speech Activity
                        </h4>
                        <div className="space-y-1">
                          <div>
                            <p className="text-2xl font-bold text-blue-200">
                              {(Number(speechMetric.speech_activity_ratio) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-blue-400">Activity Ratio</p>
                          </div>
                          {delta?.speech_activity_delta_pct !== null && delta?.speech_activity_delta_pct !== undefined && (
                            <p className="text-sm text-blue-300">
                              {Number(delta.speech_activity_delta_pct) > 0 ? '+' : ''}
                              {Number(delta.speech_activity_delta_pct).toFixed(1)}% from baseline
                            </p>
                          )}
                          <p className="text-xs text-blue-400 pt-1">
                            {speechMetric.pause_count} pauses
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Session Quality */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Session Quality
                      </h4>
                      <div className="space-y-2 text-sm">
                        {session.focus_loss_count > 0 && (
                          <p className="text-gray-400">
                            Focus losses: {session.focus_loss_count}
                          </p>
                        )}
                        {session.speech_skipped && (
                          <p className="text-gray-400">
                            Speech test: Skipped
                          </p>
                        )}
                        {reactionMetric && (
                          <p className="text-gray-400">
                            Valid trials: {reactionMetric.valid_trial_count}/{reactionMetric.total_trial_count}
                          </p>
                        )}
                        {session.focus_loss_count === 0 && !session.speech_skipped && (
                          <p className="text-teal-400">
                            ✓ Complete session
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}
