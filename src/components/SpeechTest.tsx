'use client'

import { useState, useRef } from 'react'

interface SpeechTestProps {
  onComplete: (metrics: {
    wordCount: number
    wordsPerMinute: number
    pauseCount: number
    averagePauseDuration: number
    totalDuration: number
  }) => void
  onSkip?: () => void
}

const PROMPT_TEXT = "The sun was setting behind the mountains, painting the sky in shades of orange and pink. Birds flew overhead, heading home for the evening. A gentle breeze rustled through the trees, carrying the scent of wildflowers."

export function SpeechTest({ onComplete, onSkip }: SpeechTestProps) {
  const [state, setState] = useState<'intro' | 'recording' | 'processing'>('intro')
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await analyzeAudio(audioBlob)
      }

      mediaRecorder.start()
      setState('recording')
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please grant permission and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setState('processing')
    }
  }

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/speech/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze audio')
      }

      const metrics = await response.json()
      onComplete(metrics)
    } catch (error) {
      console.error('Error analyzing audio:', error)
      alert('Failed to analyze recording. Please try again.')
      setState('intro')
    }
  }

  if (state === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-pink-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Speech Test</h2>

          <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-6 mb-6">
            <p className="text-sm text-pink-300 mb-3">Read this passage aloud:</p>
            <p className="text-white leading-relaxed">{PROMPT_TEXT}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-400 mb-6">
            <p>• Click "Start Recording" when ready</p>
            <p>• Read the passage at your natural pace</p>
            <p>• Click "Stop" when finished</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startRecording}
              className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-pink-500/30 transition-all"
            >
              Start Recording
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-800/50 font-medium text-gray-300 transition-all"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (state === 'recording') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-pink-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">Recording...</p>
            <p className="text-4xl font-mono text-pink-300 mt-2">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </p>
          </div>

          <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-pink-200">{PROMPT_TEXT}</p>
          </div>

          <button
            onClick={stopRecording}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-pink-500/30 transition-all"
          >
            Stop Recording
          </button>
        </div>
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-pink-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing your speech...</p>
        </div>
      </div>
    )
  }

  return null
}
