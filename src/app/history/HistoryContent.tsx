'use client'

import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import type { SessionWithMetrics, BaselineTracking } from '@/lib/types'

interface HistoryContentProps {
  sessions: SessionWithMetrics[]
  baseline: BaselineTracking | null
}

export function HistoryContent({ sessions, baseline }: HistoryContentProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Session History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View all your past test results
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No sessions yet. Complete your first session to see your history.
            </p>
            <button
              onClick={() => router.push('/session')}
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Session #{sessions.length - index}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(session.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                    {isBaseline && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                        Baseline Session
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Reaction Time */}
                    {reactionMetric && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">
                          Reaction Time
                        </h4>
                        <div className="space-y-1">
                          <div>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                              {Number(reactionMetric.median_rt_ms).toFixed(0)}ms
                            </p>
                            <p className="text-xs text-purple-700 dark:text-purple-300">Median</p>
                          </div>
                          {delta?.reaction_median_delta_pct !== null && delta?.reaction_median_delta_pct !== undefined && (
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                              {Number(delta.reaction_median_delta_pct) > 0 ? '+' : ''}
                              {Number(delta.reaction_median_delta_pct).toFixed(1)}% from baseline
                            </p>
                          )}
                          <p className="text-xs text-purple-600 dark:text-purple-400 pt-1">
                            Variability: ±{Number(reactionMetric.std_dev_ms).toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Speech Activity */}
                    {speechMetric && !session.speech_skipped && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                          Speech Activity
                        </h4>
                        <div className="space-y-1">
                          <div>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {(Number(speechMetric.speech_activity_ratio) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Activity Ratio</p>
                          </div>
                          {delta?.speech_activity_delta_pct !== null && delta?.speech_activity_delta_pct !== undefined && (
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {Number(delta.speech_activity_delta_pct) > 0 ? '+' : ''}
                              {Number(delta.speech_activity_delta_pct).toFixed(1)}% from baseline
                            </p>
                          )}
                          <p className="text-xs text-blue-600 dark:text-blue-400 pt-1">
                            {speechMetric.pause_count} pauses
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Session Quality */}
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                        Session Quality
                      </h4>
                      <div className="space-y-2 text-sm">
                        {session.focus_loss_count > 0 && (
                          <p className="text-gray-700 dark:text-gray-300">
                            Focus losses: {session.focus_loss_count}
                          </p>
                        )}
                        {session.speech_skipped && (
                          <p className="text-gray-700 dark:text-gray-300">
                            Speech test: Skipped
                          </p>
                        )}
                        {reactionMetric && (
                          <p className="text-gray-700 dark:text-gray-300">
                            Valid trials: {reactionMetric.valid_trial_count}/{reactionMetric.total_trial_count}
                          </p>
                        )}
                        {session.focus_loss_count === 0 && !session.speech_skipped && (
                          <p className="text-green-600 dark:text-green-400">
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
  )
}
