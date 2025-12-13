'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/lib/types'
import { ReactionTimeTest } from '@/components/ReactionTimeTest'
import { SpeechTest } from '@/components/SpeechTest'
import {
  createSession,
  saveReactionTrials,
  saveSpeechData,
  saveSpeechMetrics,
  completeSession,
  checkRecentSessions,
} from '@/lib/actions/session'
import { analyzeSpeechAudio } from '@/lib/speech-analysis'

interface SessionContentProps {
  profile: UserProfile
}

type SessionState = 'warning' | 'intro' | 'reaction' | 'speech' | 'processing' | 'complete'

export function SessionContent({ profile }: SessionContentProps) {
  const router = useRouter()
  const [state, setState] = useState<SessionState>('intro')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [recentSessionCount, setRecentSessionCount] = useState(0)
  const [loading, setLoading] = useState(true)

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

  const handleStartSession = async () => {
    const session = await createSession()
    setSessionId(session.id)
    setState('reaction')
  }

  const handleReactionComplete = async (trials: any[], focusLossCount: number) => {
    if (!sessionId) return

    try {
      await saveReactionTrials(sessionId, trials, focusLossCount)
      setState('speech')
    } catch (error) {
      console.error('Failed to save reaction trials:', error)
      alert('Failed to save reaction time data. Please try again.')
    }
  }

  const handleSpeechComplete = async (data: {
    duration_ms: number | null
    redo_used: boolean
    audio_blob: Blob | null
    skipped: boolean
  }) => {
    if (!sessionId) return

    setState('processing')

    try {
      await saveSpeechData(sessionId, data)

      if (!data.skipped && data.audio_blob) {
        const metrics = await analyzeSpeechAudio(data.audio_blob, sessionId)
        await saveSpeechMetrics(sessionId, metrics)
      }

      await completeSession(sessionId)
      setState('complete')
    } catch (error) {
      console.error('Failed to complete session:', error)
      alert('Failed to save session data. Please try again.')
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (state === 'warning') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Multiple Sessions Detected
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-6">
            <p className="text-amber-900 dark:text-amber-200">
              You've completed {recentSessionCount} session{recentSessionCount > 1 ? 's' : ''} in the last 12 hours.
              For best results, we recommend testing once per day under similar conditions.
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleStartSession}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
            >
              Continue Anyway
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Start New Session
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Each session consists of two tests:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Reaction Time Test (about 1 minute)</li>
              <li>Speech Recording (10-15 seconds)</li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Tips for Best Results
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Test at the same time of day when possible</li>
                <li>• Find a quiet, comfortable environment</li>
                <li>• Avoid testing when tired or distracted</li>
                <li>• Complete both tests in one sitting</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleStartSession}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
            >
              Begin Session
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'reaction') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <ReactionTimeTest
          onComplete={handleReactionComplete}
          onCancel={handleBackToDashboard}
        />
      </div>
    )
  }

  if (state === 'speech') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <SpeechTest
          onComplete={handleSpeechComplete}
          onCancel={handleBackToDashboard}
          audioStorageEnabled={profile.audio_storage_enabled}
        />
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Processing Session...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your results
          </p>
        </div>
      </div>
    )
  }

  if (state === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Session Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your results have been saved and your dashboard has been updated.
          </p>
          <button
            onClick={handleBackToDashboard}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
          >
            View Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}
