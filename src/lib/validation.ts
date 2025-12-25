// Input validation for session data
// Prevents users from submitting invalid or malicious data

export function validateReactionTime(reactionTimeMs: number): boolean {
  // Reaction times should be between 100ms and 10000ms (10 seconds)
  // Anything under 100ms is likely a mistake/cheat
  // Anything over 10 seconds means they weren't paying attention
  if (typeof reactionTimeMs !== 'number') return false
  if (isNaN(reactionTimeMs)) return false
  if (reactionTimeMs < 100 || reactionTimeMs > 10000) return false
  return true
}

export function validateSpeechMetrics(metrics: {
  wordCount: number
  wordsPerMinute: number
  pauseCount: number
  averagePauseDuration: number
  totalDuration: number
}) {
  // Word count: 0-300 words in a 60 second test
  if (typeof metrics.wordCount !== 'number' || metrics.wordCount < 0 || metrics.wordCount > 300) {
    return false
  }

  // WPM: 0-300 (even fast talkers don't exceed 200 WPM sustained)
  if (typeof metrics.wordsPerMinute !== 'number' || metrics.wordsPerMinute < 0 || metrics.wordsPerMinute > 300) {
    return false
  }

  // Pause count: 0-100 pauses in 60 seconds
  if (typeof metrics.pauseCount !== 'number' || metrics.pauseCount < 0 || metrics.pauseCount > 100) {
    return false
  }

  // Average pause duration: 0-5000ms (5 seconds max per pause)
  if (typeof metrics.averagePauseDuration !== 'number' || metrics.averagePauseDuration < 0 || metrics.averagePauseDuration > 5000) {
    return false
  }

  // Total duration: 30,000-90,000ms (30 seconds to 90 seconds)
  if (typeof metrics.totalDuration !== 'number' || metrics.totalDuration < 30000 || metrics.totalDuration > 90000) {
    return false
  }

  return true
}

export function validateMemoryTest(data: {
  wordSequence: string[]
  userRecall: string | null
  score: number
  totalWords: number
}) {
  // Word sequence: array of 5-10 words
  if (!Array.isArray(data.wordSequence)) return false
  if (data.wordSequence.length < 5 || data.wordSequence.length > 10) return false

  // Each word should be a string, 1-20 characters
  for (const word of data.wordSequence) {
    if (typeof word !== 'string') return false
    if (word.length < 1 || word.length > 20) return false
  }

  // User recall should be a string or null
  if (data.userRecall !== null && typeof data.userRecall !== 'string') return false
  if (data.userRecall && data.userRecall.length > 200) return false

  // Score should be between 0 and total words
  if (typeof data.score !== 'number' || data.score < 0 || data.score > data.totalWords) return false

  // Total words should match word sequence length
  if (typeof data.totalWords !== 'number' || data.totalWords !== data.wordSequence.length) return false

  return true
}

export function sanitizeString(input: string, maxLength: number = 100): string {
  // Remove any potential XSS or injection attempts
  // Trim whitespace and limit length
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s\-.,!?'"]/g, '') // Allow only safe characters
    .trim()
    .slice(0, maxLength)
}
