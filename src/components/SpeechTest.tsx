'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface SpeechTestProps {
  onComplete: (data: {
    duration_ms: number | null
    redo_used: boolean
    audio_blob: Blob | null
    skipped: boolean
  }) => void
  onCancel?: () => void
  audioStorageEnabled: boolean
}

type TestState = 'intro' | 'recording' | 'review' | 'complete' | 'permission-denied'

const PROMPT_TEXT = "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers."
const MIN_DURATION = 10000 // 10 seconds
const MAX_DURATION = 15000 // 15 seconds

export function SpeechTest({ onComplete, onCancel, audioStorageEnabled }: SpeechTestProps) {
  const [state, setState] = useState<TestState>('intro')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [redoUsed, setRedoUsed] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startTimeRef = useRef<number>(0)

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setState('review')
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      startTimeRef.current = Date.now()
      setRecordingTime(0)
      setState('recording')

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        setRecordingTime(elapsed)

        if (elapsed >= MAX_DURATION) {
          stopRecording()
        }
      }, 100)

    } catch (error) {
      console.error('Microphone access denied:', error)
      setPermissionDenied(true)
      setState('permission-denied')
    }
  }, [stopRecording])

  const handleSkip = useCallback(() => {
    onComplete({
      duration_ms: null,
      redo_used: false,
      audio_blob: null,
      skipped: true,
    })
  }, [onComplete])

  const handleRedo = useCallback(() => {
    setRedoUsed(true)
    setAudioBlob(null)
    setRecordingTime(0)
    startRecording()
  }, [startRecording])

  const handleAccept = useCallback(() => {
    setState('complete')
    onComplete({
      duration_ms: recordingTime,
      redo_used: redoUsed,
      audio_blob: audioStorageEnabled ? audioBlob : null,
      skipped: false,
    })
  }, [recordingTime, redoUsed, audioBlob, audioStorageEnabled, onComplete])

  useEffect(() => {
    return () => {
      stopRecording()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [stopRecording])

  if (state === 'permission-denied') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Microphone Access Required
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            Microphone permission was denied. You can continue without the speech test, or enable microphone access and try again.
          </p>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium"
          >
            Continue Without Speech Test
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

  if (state === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Speech Test
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            This test records your speech to measure timing patterns.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
            <p className="font-medium mb-2">Read this text aloud:</p>
            <p className="text-lg italic">"{PROMPT_TEXT}"</p>
          </div>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Speak naturally at your normal pace</li>
            <li>Read the text clearly</li>
            <li>Recording will last 10-15 seconds</li>
            <li>You'll have one chance to redo if needed</li>
            {!audioStorageEnabled && (
              <li className="text-amber-600 dark:text-amber-400">
                Audio will not be stored (privacy setting)
              </li>
            )}
          </ul>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={startRecording}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
          >
            Start Recording
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  if (state === 'recording') {
    const progress = (recordingTime / MAX_DURATION) * 100
    const timeRemaining = Math.ceil((MAX_DURATION - recordingTime) / 1000)

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Recording...
            </h2>
            <p className="text-3xl font-mono text-red-600 dark:text-red-400">
              {timeRemaining}s
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
            <p className="text-lg italic text-gray-700 dark:text-gray-300">
              "{PROMPT_TEXT}"
            </p>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {recordingTime >= MIN_DURATION && (
            <button
              onClick={stopRecording}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium"
            >
              Stop Recording
            </button>
          )}
        </div>
      </div>
    )
  }

  if (state === 'review') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Recording Complete
        </h2>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
            <p className="text-green-800 dark:text-green-200">
              ✓ Recorded {(recordingTime / 1000).toFixed(1)} seconds
            </p>
          </div>

          {audioBlob && (
            <div>
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleAccept}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
            >
              Accept
            </button>
            {!redoUsed && (
              <button
                onClick={handleRedo}
                className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
              >
                Redo
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
