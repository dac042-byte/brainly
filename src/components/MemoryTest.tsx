'use client'

import { useState, useEffect } from 'react'

interface MemoryTestProps {
  mode: 'encoding' | 'recall'
  wordSequence?: string[] // Pass from encoding to recall
  onEncodingComplete: (wordSequence: string[]) => void
  onRecallComplete: (score: number, totalWords: number, userRecall: string) => void
}

const ENCODING_DURATION = 10 // seconds

export function MemoryTest({ mode, wordSequence, onEncodingComplete, onRecallComplete }: MemoryTestProps) {
  const [words, setWords] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(ENCODING_DURATION)
  const [userRecall, setUserRecall] = useState('')
  const [loading, setLoading] = useState(true)

  // Load word bank and generate sequence for encoding mode
  useEffect(() => {
    if (mode === 'encoding') {
      loadWordsAndGenerate()
    } else if (mode === 'recall' && wordSequence) {
      setWords(wordSequence)
      setLoading(false)
    }
  }, [mode, wordSequence])

  const loadWordsAndGenerate = async () => {
    try {
      const response = await fetch('/memory_bank.json')
      const data = await response.json()
      const wordBank: string[] = data.words

      // Generate 3-5 word phrases (random length)
      const phraseLength = Math.floor(Math.random() * 3) + 3 // 3-5 words
      const selectedWords: string[] = []

      for (let i = 0; i < phraseLength; i++) {
        const randomIndex = Math.floor(Math.random() * wordBank.length)
        selectedWords.push(wordBank[randomIndex])
      }

      setWords(selectedWords)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load word bank:', error)
      setWords(['apple', 'tree', 'river']) // Fallback
      setLoading(false)
    }
  }

  // Encoding timer
  useEffect(() => {
    if (mode === 'encoding' && !loading && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Auto-advance after encoding completes
            setTimeout(() => {
              onEncodingComplete(words)
            }, 500)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [mode, loading, timeRemaining, words, onEncodingComplete])

  const handleRecallSubmit = () => {
    const score = calculateScore(words, userRecall)
    onRecallComplete(score, words.length, userRecall)
  }

  const calculateScore = (targetWords: string[], recallText: string): number => {
    // Normalize: lowercase, remove punctuation, split by whitespace/commas
    const normalized = recallText
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .trim()

    if (!normalized) return 0

    const recallWords = normalized.split(/\s+/)

    // Count how many target words appear in the recall
    let correctCount = 0
    const targetSet = new Set(targetWords.map((w) => w.toLowerCase()))

    for (const word of recallWords) {
      if (targetSet.has(word) && !targetSet.has(`_counted_${word}`)) {
        correctCount++
        targetSet.delete(word)
        targetSet.add(`_counted_${word}`) // Prevent double-counting
      }
    }

    return correctCount
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Preparing memory test...</p>
        </div>
      </div>
    )
  }

  // ENCODING MODE: Show words for 20 seconds
  if (mode === 'encoding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Memory Encoding Phase</h2>

          <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-8 mb-6">
            <p className="text-sm text-rose-400 mb-6">Memorize these words:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {words.map((word, index) => (
                <span
                  key={index}
                  className="text-4xl font-bold text-white bg-rose-700/30 px-8 py-4 rounded-xl border border-rose-600/50"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="text-6xl font-mono font-bold text-rose-400">
              {timeRemaining}
            </div>
            <div className="text-slate-400">seconds remaining</div>
          </div>

          <p className="text-slate-400 text-sm mt-6">
            You'll recall these words after completing other tasks
          </p>
        </div>
      </div>
    )
  }

  // RECALL MODE: Collect delayed recall
  if (mode === 'recall') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Memory Recall Phase</h2>

          <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-6 mb-6">
            <p className="text-rose-300 mb-2">
              <strong>Instructions:</strong>
            </p>
            <ul className="text-sm text-rose-300/80 space-y-1">
              <li>• Recall the words you saw at the beginning of this session</li>
              <li>• Type them in any order, separated by spaces or commas</li>
              <li>• Don't worry about perfect spelling</li>
              <li>• Submit when you've recalled all you can remember</li>
            </ul>
          </div>

          <textarea
            value={userRecall}
            onChange={(e) => setUserRecall(e.target.value)}
            placeholder="Type the words you remember here..."
            className="w-full h-40 px-4 py-3 border border-slate-750 rounded-xl bg-slate-800/50 text-white text-lg focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none"
            autoFocus
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleRecallSubmit}
              disabled={!userRecall.trim()}
              className="flex-1 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-rose-900/20 transition-all"
            >
              Submit Recall
            </button>
          </div>

          <p className="text-gray-500 text-xs mt-4 text-center">
            This tests your delayed free recall - a measure of memory retention
          </p>
        </div>
      </div>
    )
  }

  return null
}
