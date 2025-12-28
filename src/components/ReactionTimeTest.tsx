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

const PRACTICE_TRIALS = 0
const MEASURED_TRIALS = 5
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
          setState('ready')
        } else {
          setState('complete')
        }
      }, 1500)
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
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
          Reaction Time Test
        </h2>
        <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-300">
          <p>
            This test measures how quickly you respond to a visual stimulus.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
            <li>You'll see a "Get Ready" screen</li>
            <li>After a random delay, a green circle will appear</li>
            <li>Click or tap as quickly as possible when you see it</li>
            <li>Don't click early - wait for the green circle</li>
            <li>Stay focused - the test pauses if you switch windows</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-400">
            You'll complete {MEASURED_TRIALS} trials. Each trial takes just a few seconds.
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setState('ready')}
            className="flex-1 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200"
          >
            Start Test
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-slate-750 hover:bg-slate-800/50 font-medium text-sm sm:text-base text-slate-300 transition-all duration-200"
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
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-red-400">
            Too Early!
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Wait for the green circle before clicking.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
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
        className="mx-auto w-80 h-80 sm:w-96 sm:h-96 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 cursor-pointer flex items-center justify-center transition-all duration-200 active:scale-95"
      >
        <p className="text-slate-400 text-base sm:text-lg font-medium">
          Wait for it...
        </p>
      </div>
    )
  }

  if (state === 'stimulus') {
    return (
      <div
        onClick={handleResponse}
        className="mx-auto w-80 h-80 sm:w-96 sm:h-96 bg-green-500 rounded-2xl shadow-2xl cursor-pointer flex items-center justify-center transition-all duration-200 active:scale-95"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-600 rounded-full shadow-lg"></div>
      </div>
    )
  }

  if (state === 'response') {
    const lastTrial = trials[trials.length - 1]
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4">✓</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-green-400">
            {lastTrial.reaction_time_ms}ms
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {isPractice ? 'Practice' : 'Trial'} {currentTrialIndex + 1} of {totalTrials}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
          Get Ready
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          {isPractice ? 'Practice' : 'Trial'} {currentTrialIndex + 1} of {totalTrials}
        </p>
        {focusLossCount > 0 && (
          <p className="text-xs sm:text-sm text-amber-400 mt-2">
            Focus restored. Test paused {focusLossCount} time{focusLossCount > 1 ? 's' : ''}.
          </p>
        )}
      </div>
    </div>
  )
}
