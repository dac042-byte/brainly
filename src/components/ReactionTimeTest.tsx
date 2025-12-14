'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TrialData {
  trial_index: number
  is_practice: boolean
  random_delay_ms: number
  stimulus_timestamp: string
  response_timestamp: string | null
  reaction_time_ms: number | null
  early_click_count: number
  focus_lost: boolean
  input_method: string
}

interface ReactionTimeTestProps {
  onComplete: (trials: TrialData[], focusLossCount: number) => void
  onCancel?: () => void
}

type TestState = 'intro' | 'ready' | 'waiting' | 'stimulus' | 'response' | 'early' | 'complete'

const PRACTICE_TRIALS = 2
const MEASURED_TRIALS = 10
const MIN_DELAY = 1000
const MAX_DELAY = 3000

export function ReactionTimeTest({ onComplete, onCancel }: ReactionTimeTestProps) {
  const [state, setState] = useState<TestState>('intro')
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0)
  const [trials, setTrials] = useState<TrialData[]>([])
  const [focusLossCount, setFocusLossCount] = useState(0)
  const [earlyClickCount, setEarlyClickCount] = useState(0)

  const stimulusTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentTrialRef = useRef<Partial<TrialData>>({})
  const hasFocusRef = useRef(true)

  const totalTrials = PRACTICE_TRIALS + MEASURED_TRIALS
  const isPractice = currentTrialIndex < PRACTICE_TRIALS

  const getRandomDelay = () => Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY

  const resetTrial = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startTrial = useCallback(() => {
    resetTrial()
    setEarlyClickCount(0)

    const randomDelay = getRandomDelay()
    currentTrialRef.current = {
      trial_index: currentTrialIndex,
      is_practice: isPractice,
      random_delay_ms: randomDelay,
      early_click_count: 0,
      focus_lost: false,
      input_method: 'mouse',
    }

    setState('ready')

    setTimeout(() => {
      setState('waiting')

      timeoutRef.current = setTimeout(() => {
        stimulusTimeRef.current = Date.now()
        currentTrialRef.current.stimulus_timestamp = new Date().toISOString()
        setState('stimulus')
      }, randomDelay)
    }, 1500)
  }, [currentTrialIndex, isPractice, resetTrial])

  const handleResponse = useCallback(() => {
    if (state === 'waiting') {
      setEarlyClickCount(prev => prev + 1)
      currentTrialRef.current.early_click_count = (currentTrialRef.current.early_click_count || 0) + 1
      resetTrial()
      setState('early')
      setTimeout(() => {
        startTrial()
      }, 1500)
      return
    }

    if (state === 'stimulus') {
      const responseTime = Date.now()
      const reactionTime = responseTime - stimulusTimeRef.current

      const trialData: TrialData = {
        trial_index: currentTrialRef.current.trial_index!,
        is_practice: currentTrialRef.current.is_practice!,
        random_delay_ms: currentTrialRef.current.random_delay_ms!,
        stimulus_timestamp: currentTrialRef.current.stimulus_timestamp!,
        response_timestamp: new Date().toISOString(),
        reaction_time_ms: reactionTime,
        early_click_count: currentTrialRef.current.early_click_count || 0,
        focus_lost: currentTrialRef.current.focus_lost || false,
        input_method: 'mouse',
      }

      setTrials(prev => [...prev, trialData])
      setState('response')

      setTimeout(() => {
        if (currentTrialIndex + 1 < totalTrials) {
          setCurrentTrialIndex(prev => prev + 1)
        } else {
          setState('complete')
        }
      }, 3000)
    }
  }, [state, currentTrialIndex, totalTrials, resetTrial, startTrial])

  const handleFocusLoss = useCallback(() => {
    if (state === 'waiting' || state === 'stimulus') {
      setFocusLossCount(prev => prev + 1)
      currentTrialRef.current.focus_lost = true
      resetTrial()
      setState('ready')
    }
  }, [state, resetTrial])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hasFocusRef.current = false
        handleFocusLoss()
      } else {
        hasFocusRef.current = true
      }
    }

    const handleBlur = () => {
      hasFocusRef.current = false
      handleFocusLoss()
    }

    const handleFocus = () => {
      hasFocusRef.current = true
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [handleFocusLoss])

  useEffect(() => {
    if (state === 'ready' && currentTrialIndex < totalTrials) {
      startTrial()
    }
  }, [state, currentTrialIndex, totalTrials, startTrial])

  useEffect(() => {
    if (state === 'complete') {
      resetTrial()
      onComplete(trials, focusLossCount)
    }
  }, [state, trials, focusLossCount, onComplete, resetTrial])

  useEffect(() => {
    return () => {
      resetTrial()
    }
  }, [resetTrial])

  if (state === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Reaction Time Test
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            This test measures how quickly you respond to a visual stimulus.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>You'll see a "Get Ready" screen</li>
            <li>After a random delay, a green circle will appear</li>
            <li>Click or tap as quickly as possible when you see it</li>
            <li>Don't click early - wait for the green circle</li>
            <li>Stay focused - the test pauses if you switch windows</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You'll do {PRACTICE_TRIALS} practice trials, then {MEASURED_TRIALS} measured trials.
          </p>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setState('ready')}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
          >
            Start Test
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  if (state === 'early') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
            Too Early!
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Wait for the green circle before clicking.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Restarting trial...
          </p>
        </div>
      </div>
    )
  }

  if (state === 'waiting') {
    return (
      <div
        onClick={handleResponse}
        className="max-w-2xl mx-auto h-96 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg cursor-pointer flex items-center justify-center"
      >
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Wait for it...
        </p>
      </div>
    )
  }

  if (state === 'stimulus') {
    return (
      <div
        onClick={handleResponse}
        className="max-w-2xl mx-auto h-96 bg-green-500 rounded-lg shadow-lg cursor-pointer flex items-center justify-center"
      >
        <div className="w-32 h-32 bg-green-600 rounded-full"></div>
      </div>
    )
  }

  if (state === 'response') {
    const lastTrial = trials[trials.length - 1]
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
            {lastTrial.reaction_time_ms}ms
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isPractice ? 'Practice' : 'Trial'} {currentTrialIndex + 1} of {totalTrials}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Get Ready
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isPractice ? 'Practice' : 'Trial'} {currentTrialIndex + 1} of {totalTrials}
        </p>
        {focusLossCount > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            Focus restored. Test paused {focusLossCount} time{focusLossCount > 1 ? 's' : ''}.
          </p>
        )}
      </div>
    </div>
  )
}
