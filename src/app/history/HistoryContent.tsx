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
          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Session History</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Complete your first session to start tracking your cognitive performance over time.
                All your past sessions will appear here.
              </p>
              <button
                onClick={() => router.push('/session')}
                className="px-8 py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all shadow-lg shadow-rose-900/30 font-medium"
              >
                Start First Session
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const reactionMetric = session.reaction_metrics?.[0]
              const speechMetric = session.speech_metrics?.[0]
              const memoryTest = session.memory_tests?.[0]
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Reaction Time */}
                    {reactionMetric && (
                      <div className="bg-rose-900/20 rounded-xl p-4 border border-rose-700/30">
                        <h4 className="text-sm font-medium text-rose-400 mb-3">
                          Reaction Time (50%)
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-2xl font-bold text-rose-200">
                              {Number(reactionMetric.median_rt_ms).toFixed(0)}ms
                            </p>
                            <p className="text-xs text-rose-400">Median</p>
                          </div>
                          {delta?.reaction_median_delta_pct !== null && delta?.reaction_median_delta_pct !== undefined && (
                            <p className="text-sm text-rose-300">
                              {Number(delta.reaction_median_delta_pct) > 0 ? '+' : ''}
                              {Number(delta.reaction_median_delta_pct).toFixed(1)}% from baseline
                            </p>
                          )}
                          <p className="text-xs text-rose-400">
                            Variability: ±{Number(reactionMetric.std_dev_ms).toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Speech Metrics */}
                    {speechMetric && !session.speech_skipped && (
                      <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                        <h4 className="text-sm font-medium text-blue-300 mb-3">
                          Speech Timing (30%)
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-2xl font-bold text-blue-200">
                              {Number(speechMetric.words_per_minute || 0).toFixed(0)} wpm
                            </p>
                            <p className="text-xs text-blue-400">Speaking Rate</p>
                          </div>
                          <div className="text-xs text-blue-400 space-y-1">
                            <p>Pauses: {speechMetric.pause_count} ({Number(speechMetric.avg_pause_length_ms || 0).toFixed(0)}ms avg)</p>
                            <p>Activity: {(Number(speechMetric.speech_activity_ratio) * 100).toFixed(1)}%</p>
                            <p>Words: {speechMetric.word_count}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Memory Recall */}
                    {memoryTest && (
                      <div className="bg-teal-900/20 rounded-xl p-4 border border-teal-500/20">
                        <h4 className="text-sm font-medium text-teal-300 mb-3">
                          Memory Recall (20%)
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-2xl font-bold text-teal-200">
                              {memoryTest.total_words > 0
                                ? ((memoryTest.score / memoryTest.total_words) * 100).toFixed(0)
                                : '0'}%
                            </p>
                            <p className="text-xs text-teal-400">Accuracy</p>
                          </div>
                          <p className="text-xs text-teal-400">
                            {memoryTest.score}/{memoryTest.total_words} words
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Overall Score */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-750/50">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        Overall Score
                      </h4>
                      <div className="space-y-2">
                        {delta?.weighted_score !== null && delta?.weighted_score !== undefined ? (
                          <>
                            <div>
                              <p className="text-2xl font-bold text-white">
                                {Math.round(Number(delta.weighted_score))}
                              </p>
                              <p className="text-xs text-slate-400">/ 100</p>
                            </div>
                            <p className="text-xs text-slate-400">
                              Weighted combination of all tests
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">Baseline session</p>
                        )}
                        <div className="text-xs text-slate-400 space-y-1 pt-2">
                          {session.focus_loss_count > 0 && (
                            <p>Focus losses: {session.focus_loss_count}</p>
                          )}
                          {session.speech_skipped && (
                            <p>Speech: Skipped</p>
                          )}
                          {session.focus_loss_count === 0 && !session.speech_skipped && (
                            <p className="text-teal-400">✓ Complete</p>
                          )}
                        </div>
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
