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

const PASSAGE_BANK = [
  "The sun was setting behind the mountains, painting the sky in shades of orange and pink. Birds flew overhead, heading home for the evening. A gentle breeze rustled through the trees, carrying the scent of wildflowers.",

  "Morning coffee steamed in the ceramic mug, filling the kitchen with a rich aroma. Outside the window, rain tapped gently against the glass. The world seemed peaceful and quiet, wrapped in a blanket of gray clouds.",

  "The library stood silent except for the soft rustle of turning pages. Rows of wooden shelves stretched toward the ceiling, filled with countless stories. Afternoon sunlight filtered through tall windows, creating patterns on the worn wooden floor.",

  "Waves crashed against the rocky shore, sending white foam dancing across the sand. Seagulls called out overhead, circling in the clear blue sky. The salty ocean breeze carried the promise of summer adventures and distant journeys.",

  "Fresh snow covered the quiet street, muffling all sounds beneath its white blanket. Footprints marked a winding path through the untouched surface. Icicles hung from the roof edges, sparkling like crystals in the cold winter light.",

  "The garden bloomed with vibrant colors as spring arrived in full force. Bees hummed busily among the flowers, gathering nectar from each bloom. Butterflies danced from petal to petal, their delicate wings catching the warm afternoon sun.",

  "City lights began to flicker on as dusk settled over the bustling streets. Cars moved in steady streams, their headlights creating rivers of light. People hurried along sidewalks, heading home after long days at work.",

  "The old bookstore smelled of aged paper and leather bindings. Dust motes floated in shafts of sunlight that pierced the dimness. Each shelf held treasures waiting to be discovered by wandering hands and curious minds.",

  "Thunder rumbled in the distance as dark clouds gathered on the horizon. The wind picked up, bending the trees and scattering leaves across the yard. A few drops began to fall, promising a summer storm would soon arrive.",

  "The bakery window displayed fresh pastries in neat, tempting rows. Golden croissants sat beside chocolate eclairs and fruit tarts. The sweet smell drifted onto the street, drawing passersby closer to admire the delicious creations."
]

// Select a random passage for each test session
const getRandomPassage = () => PASSAGE_BANK[Math.floor(Math.random() * PASSAGE_BANK.length)]

export function SpeechTest({ onComplete, onSkip }: SpeechTestProps) {
  const [state, setState] = useState<'intro' | 'recording' | 'processing'>('intro')
  const [recordingTime, setRecordingTime] = useState(0)
  const [promptText] = useState(getRandomPassage()) // Select passage once per component mount
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center p-4 py-8">
        <div className="max-w-2xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Speech Test</h2>

          <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-rose-400 mb-3">Read this passage aloud:</p>
            <p className="text-sm sm:text-base text-white leading-relaxed">{promptText}</p>
          </div>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
            <p>• Click "Start Recording" when ready</p>
            <p>• Read the passage at your natural pace</p>
            <p>• Click "Stop" when finished</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={startRecording}
              className="flex-1 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium text-sm sm:text-base shadow-lg shadow-rose-900/20 transition-all duration-200"
            >
              Start Recording
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-6 py-3 rounded-xl border border-slate-750 hover:bg-slate-800/50 font-medium text-sm sm:text-base text-slate-300 transition-all duration-200"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center p-4 py-8">
        <div className="max-w-2xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6 sm:p-8 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-rose-600/60 rounded-full animate-pulse-recording"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-rose-700 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-pulse-recording"></div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">Recording...</p>
            <p className="text-3xl sm:text-4xl font-mono text-rose-400 mt-2">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </p>
          </div>

          <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-rose-300">{promptText}</p>
          </div>

          <button
            onClick={stopRecording}
            className="bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white px-6 sm:px-8 py-3 rounded-xl font-medium text-sm sm:text-base shadow-lg shadow-rose-900/20 transition-all duration-200"
          >
            Stop Recording
          </button>
        </div>
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center p-4 py-8">
        <div className="max-w-2xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6 sm:p-8 text-center">
          <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-white text-base sm:text-lg">Analyzing your speech...</p>
        </div>
      </div>
    )
  }

  return null
}
