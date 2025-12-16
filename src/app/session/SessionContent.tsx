'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/lib/types'
import { ReactionTimeTest } from '@/components/ReactionTimeTest'
import { MemoryTest } from '@/components/MemoryTest'
import { SpeechTest } from '@/components/SpeechTest'
import {
  createSession,
  saveReactionTrials,
  completeSession,
  checkRecentSessions,
} from '@/lib/actions/session'
import { createClient } from '@/lib/supabase/client'

interface SessionContentProps {
  profile: UserProfile
}

type SessionState = 'warning' | 'intro' | 'memory-encoding' | 'reaction' | 'speech' | 'memory-recall' | 'processing' | 'complete'

export function SessionContent({ profile }: SessionContentProps) {
  const router = useRouter()
  const [state, setState] = useState<SessionState>('intro')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [recentSessionCount, setRecentSessionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [memoryWordSequence, setMemoryWordSequence] = useState<string[]>([])
  const [memoryScore, setMemoryScore] = useState<number>(0)
  const [reactionMetrics, setReactionMetrics] = useState<{
    medianRT: number
    trials: number
  } | null>(null)
  const [speechMetrics, setSpeechMetrics] = useState<{
    wordCount: number
    wordsPerMinute: number
    pauseCount: number
    averagePauseDuration: number
    totalDuration: number
  } | null>(null)

  useEffect(() => {
    async function checkSessions() {
      const result = await checkRecentSessions()
      if (result.hasRecent && result.count > 0) {
        setRecentSessionCount(result.count)
        setState('warning')
      }
      setLoading(false)
    }
    checkSessions()
  }, [])

  // Detect session abandonment (user leaving mid-test)
  useEffect(() => {
    let abandonedSession = false

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the page - check if session is in progress
        const inProgressStates: SessionState[] = ['memory-encoding', 'reaction', 'speech', 'memory-recall']
        if (sessionId && inProgressStates.includes(state)) {
          // Session abandoned - delete it
          abandonedSession = true
          const supabase = createClient()
          supabase.from('sessions').delete().eq('id', sessionId).then(() => {
            console.log('Session abandoned and deleted')
          })
        }
      } else if (abandonedSession) {
        // User came back - reset to intro
        setSessionId(null)
        setState('intro')
        setMemoryWordSequence([])
        setMemoryScore(0)
        setSpeechMetrics(null)
        abandonedSession = false
        alert('Your previous session was cancelled because you left the page. Please start a new session.')
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const inProgressStates: SessionState[] = ['memory-encoding', 'reaction', 'speech', 'memory-recall']
      if (sessionId && inProgressStates.includes(state)) {
        e.preventDefault()
        e.returnValue = 'Your session progress will be lost. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionId, state])

  const handleStartSession = async () => {
    const session = await createSession()
    setSessionId(session.id)
    setState('memory-encoding')
  }

  const handleMemoryEncodingComplete = (wordSequence: string[]) => {
    setMemoryWordSequence(wordSequence)
    setState('reaction')
  }

  const handleReactionComplete = async (trials: any[], focusLossCount: number) => {
    if (!sessionId) return

    try {
      // Calculate median reaction time
      const validTrials = trials.filter(t => !t.invalid)
      const reactionTimes = validTrials.map(t => t.reactionTime).sort((a, b) => a - b)
      const median = reactionTimes.length > 0
        ? reactionTimes[Math.floor(reactionTimes.length / 2)]
        : 0

      setReactionMetrics({
        medianRT: Math.round(median),
        trials: validTrials.length
      })

      await saveReactionTrials(sessionId, trials, focusLossCount)
      setState('speech')
    } catch (error) {
      console.error('Failed to save reaction trials:', error)
      alert('Failed to save reaction time data. Please try again.')
      setState('reaction')
    }
  }

  const handleSpeechComplete = async (metrics: {
    wordCount: number
    wordsPerMinute: number
    pauseCount: number
    averagePauseDuration: number
    totalDuration: number
  }) => {
    if (!sessionId) return

    try {
      const supabase = createClient()

      // Save speech metrics
      await supabase.from('speech_tests').insert({
        session_id: sessionId,
        word_count: metrics.wordCount,
        words_per_minute: metrics.wordsPerMinute,
        pause_count: metrics.pauseCount,
        average_pause_duration: metrics.averagePauseDuration,
        total_duration: metrics.totalDuration
      })

      setSpeechMetrics(metrics)
      setState('memory-recall')
    } catch (error) {
      console.error('Failed to save speech metrics:', error)
      alert('Failed to save speech data. Please try again.')
      setState('speech')
    }
  }

  const handleMemoryRecallComplete = async (score: number, totalWords: number, userRecall: string) => {
    if (!sessionId) return

    setState('processing')

    try {
      const supabase = createClient()

      // Save memory test results
      await supabase.from('memory_tests').insert({
        session_id: sessionId,
        word_sequence: memoryWordSequence,
        user_recall: userRecall,
        score: score,
        total_words: totalWords
      })

      // Update streak
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.rpc('update_user_streak', {
          p_user_id: user.id,
          p_test_date: new Date().toISOString().split('T')[0]
        })
      }

      // Complete session
      await completeSession(sessionId)
      setMemoryScore(score)
      setState('complete')
    } catch (error) {
      console.error('Failed to save memory test:', error)
      alert('Failed to save memory test data. Please try again.')
      setState('memory-recall')
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (state === 'warning') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4">
        <div className="max-w-2xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Multiple Sessions Detected
          </h2>
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-200">
              You've completed {recentSessionCount} session{recentSessionCount > 1 ? 's' : ''} in the last 12 hours.
              For best results, we recommend testing once per day under similar conditions.
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleStartSession}
              className="flex-1 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-rose-900/20 transition-all duration-200"
            >
              Continue Anyway
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 rounded-xl border border-slate-750 hover:bg-slate-800/50 font-medium text-slate-300 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4">
        <div className="max-w-2xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Start New Session
          </h2>
          <div className="space-y-4 text-slate-300">
            <p>
              This session includes memory encoding, reaction time testing, speech analysis, and delayed memory recall.
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Memorize words (10 seconds)</li>
              <li>Complete reaction time test</li>
              <li>Record speech sample</li>
              <li>Recall the words from memory</li>
            </ol>
            <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-rose-400 mb-2">
                Tips for Best Results
              </h3>
              <ul className="text-sm text-rose-300/80 space-y-1">
                <li>• Test at the same time each week to maintain your streak</li>
                <li>• Find a quiet, comfortable environment</li>
                <li>• Avoid testing when tired or distracted</li>
                <li>• Stay focused throughout all tests</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleStartSession}
              className="flex-1 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-rose-900/20 transition-all duration-200 hover:shadow-rose-900/30"
            >
              Begin Session
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 rounded-xl border border-slate-750 hover:bg-slate-800/50 hover:border-slate-700 font-medium text-slate-300 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'memory-encoding') {
    return (
      <MemoryTest
        mode="encoding"
        onEncodingComplete={handleMemoryEncodingComplete}
        onRecallComplete={() => {}}
      />
    )
  }

  if (state === 'reaction') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4 py-8">
        <ReactionTimeTest
          onComplete={handleReactionComplete}
          onCancel={handleBackToDashboard}
        />
      </div>
    )
  }

  if (state === 'speech') {
    return <SpeechTest onComplete={handleSpeechComplete} />
  }

  if (state === 'memory-recall') {
    return (
      <MemoryTest
        mode="recall"
        wordSequence={memoryWordSequence}
        onEncodingComplete={() => {}}
        onRecallComplete={handleMemoryRecallComplete}
      />
    )
  }

  if (state === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4 animate-fade-in">
        <div className="max-w-2xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8 text-center animate-slide-up">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <h2 className="text-3xl font-bold mb-2 text-white">
            Processing Session...
          </h2>
          <p className="text-slate-400">
            Analyzing your results
          </p>
        </div>
      </div>
    )
  }

  if (state === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 px-4 animate-fade-in">
        <div className="max-w-3xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8 text-center animate-slide-up">
          <div className="text-6xl mb-4 animate-fade-in">✓</div>
          <h2 className="text-3xl font-bold mb-2 text-white">
            Session Complete!
          </h2>
          <p className="text-slate-400 mb-8">
            Your results have been saved and your streak has been updated.
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Reaction Time */}
            {reactionMetrics && (
              <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-5 hover:bg-rose-900/25 transition-colors duration-300">
                <p className="text-rose-400 text-sm mb-2 font-medium">Reaction Time</p>
                <p className="text-4xl font-bold text-white animate-count-up">
                  {reactionMetrics.medianRT}
                </p>
                <p className="text-rose-300/60 text-xs mt-1">
                  milliseconds (median)
                </p>
              </div>
            )}

            {/* Speech Activity */}
            {speechMetrics && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 hover:bg-blue-900/25 transition-colors duration-300">
                <p className="text-blue-400 text-sm mb-2 font-medium">Speech Activity</p>
                <p className="text-4xl font-bold text-white animate-count-up">
                  {speechMetrics.wordsPerMinute.toFixed(0)}
                </p>
                <p className="text-blue-300/60 text-xs mt-1">
                  words per minute
                </p>
              </div>
            )}

            {/* Memory Recall */}
            <div className="bg-teal-900/20 border border-teal-500/30 rounded-xl p-5 hover:bg-teal-900/25 transition-colors duration-300">
              <p className="text-teal-400 text-sm mb-2 font-medium">Memory Recall</p>
              <p className="text-4xl font-bold text-white animate-count-up">
                {memoryWordSequence.length > 0
                  ? Math.round((memoryScore / memoryWordSequence.length) * 100)
                  : 0}%
              </p>
              <p className="text-teal-300/60 text-xs mt-1">
                {memoryScore} of {memoryWordSequence.length} words
              </p>
            </div>
          </div>

          <button
            onClick={handleBackToDashboard}
            className="bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-rose-900/20 hover:shadow-rose-900/30 transition-all duration-200 hover:scale-[1.02]"
          >
            View Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}
