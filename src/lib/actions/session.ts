// Client-side session actions for mobile app compatibility
import { createClient } from '@/lib/supabase/client'
import { validateReactionTime, validateSpeechMetrics } from '@/lib/validation'
import { checkRateLimit, RATE_LIMITS } from '@/lib/ratelimit'

interface ReactionTrialInput {
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

export async function createSession() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Rate limit session creation (10 per hour)
  const rateLimitCheck = await checkRateLimit(
    `session_create:${user.id}`,
    RATE_LIMITS.SESSION_CREATE
  )

  if (!rateLimitCheck.allowed) {
    throw new Error('Too many sessions created. Please wait before starting another.')
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      version: 'v1.0',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveReactionTrials(sessionId: string, trials: ReactionTrialInput[], focusLossCount: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate reaction times
  for (const trial of trials) {
    if (trial.reaction_time_ms !== null && !validateReactionTime(trial.reaction_time_ms)) {
      throw new Error('Invalid reaction time detected')
    }
  }

  // Validate focus loss count (should be reasonable)
  if (focusLossCount < 0 || focusLossCount > 50) {
    throw new Error('Invalid focus loss count')
  }

  const { error: trialsError } = await supabase
    .from('reaction_trials')
    .insert(trials.map(trial => ({
      session_id: sessionId,
      ...trial,
    })))

  if (trialsError) throw trialsError

  const validTrials = trials.filter(t => !t.is_practice && t.reaction_time_ms !== null)
  const reactionTimes = validTrials.map(t => t.reaction_time_ms!)

  if (reactionTimes.length === 0) {
    throw new Error('No valid reaction time trials')
  }

  const sortedTimes = [...reactionTimes].sort((a, b) => a - b)
  const median = sortedTimes.length % 2 === 0
    ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
    : sortedTimes[Math.floor(sortedTimes.length / 2)]

  const mean = reactionTimes.reduce((sum, t) => sum + t, 0) / reactionTimes.length
  const variance = reactionTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / reactionTimes.length
  const stdDev = Math.sqrt(variance)

  const outlierThreshold = mean + (2 * stdDev)
  const outlierCount = reactionTimes.filter(t => t > outlierThreshold).length

  const { error: metricsError } = await supabase
    .from('reaction_metrics')
    .insert({
      session_id: sessionId,
      median_rt_ms: median,
      mean_rt_ms: mean,
      std_dev_ms: stdDev,
      outlier_count: outlierCount,
      valid_trial_count: validTrials.length,
      total_trial_count: trials.length,
    })

  if (metricsError) throw metricsError

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ focus_loss_count: focusLossCount })
    .eq('id', sessionId)

  if (updateError) throw updateError

  return { median, mean, stdDev, outlierCount }
}

export async function saveSpeechData(
  sessionId: string,
  data: {
    duration_ms: number | null
    redo_used: boolean
    audio_blob: Blob | null
    skipped: boolean
  }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  let audioStorageUrl: string | null = null

  if (data.audio_blob && !data.skipped) {
    const fileName = `${user.id}/${sessionId}-${Date.now()}.webm`
    const { error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(fileName, data.audio_blob)

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(fileName)
      audioStorageUrl = urlData.publicUrl
    }
  }

  const { error } = await supabase
    .from('speech_data')
    .insert({
      session_id: sessionId,
      prompt_id: 'default_v1',
      completion_status: data.skipped ? 'skipped' : 'completed',
      duration_ms: data.duration_ms,
      redo_used: data.redo_used,
      audio_storage_url: audioStorageUrl,
      recorded_at: data.skipped ? null : new Date().toISOString(),
    })

  if (error) throw error

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ speech_skipped: data.skipped })
    .eq('id', sessionId)

  if (updateError) throw updateError
}

export async function saveSpeechMetrics(
  sessionId: string,
  metrics: {
    voiced_time_ms: number
    pause_time_ms: number
    pause_count: number
    avg_pause_length_ms: number
    speech_activity_ratio: number
    word_count?: number
    words_per_minute?: number
  }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate speech metrics before saving
  const totalDuration = metrics.voiced_time_ms + metrics.pause_time_ms
  const validationData = {
    wordCount: metrics.word_count || 0,
    wordsPerMinute: metrics.words_per_minute || 0,
    pauseCount: metrics.pause_count,
    averagePauseDuration: metrics.avg_pause_length_ms,
    totalDuration: totalDuration
  }

  if (!validateSpeechMetrics(validationData)) {
    throw new Error('Invalid speech metrics detected')
  }

  const { error } = await supabase
    .from('speech_metrics')
    .insert({
      session_id: sessionId,
      ...metrics,
    })

  if (error) throw error
}

export async function completeSession(sessionId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw error

  await computeBaseline(user.id)
  await computeSessionDeltas(sessionId, user.id)
}

async function computeBaseline(userId: string) {
  const supabase = createClient()

  const { data: existingBaseline } = await supabase
    .from('baseline_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('is_current', true)
    .single()

  if (existingBaseline) {
    return
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      reaction_metrics(median_rt_ms, std_dev_ms),
      speech_metrics(speech_activity_ratio, avg_pause_length_ms, words_per_minute),
      memory_tests(score, total_words)
    `)
    .eq('user_id', userId)
    .eq('is_baseline_eligible', true)
    .not('completed_at', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)

  if (!sessions || sessions.length < 1) {
    return
  }

  const sessionIds = sessions.map(s => s.id)
  const reactionMetrics = sessions
    .map((s: any) => s.reaction_metrics?.[0])
    .filter(Boolean)

  if (reactionMetrics.length < 1) {
    return
  }

  const baselineMedianRt = reactionMetrics.reduce((sum: number, m: any) => sum + Number(m.median_rt_ms), 0) / 1
  const baselineStdDev = reactionMetrics.reduce((sum: number, m: any) => sum + Number(m.std_dev_ms), 0) / 1

  const speechMetrics = sessions
    .map((s: any) => s.speech_metrics?.[0])
    .filter(Boolean)

  const baselineSpeechActivity = speechMetrics.length >= 1
    ? speechMetrics.reduce((sum: number, m: any) => sum + Number(m.speech_activity_ratio), 0) / 1
    : null

  const baselineAvgPause = speechMetrics.length >= 1
    ? speechMetrics.reduce((sum: number, m: any) => sum + Number(m.avg_pause_length_ms || 0), 0) / 1
    : null

  const baselineWpm = speechMetrics.length >= 1
    ? speechMetrics.reduce((sum: number, m: any) => sum + Number(m.words_per_minute || 0), 0) / 1
    : null

  const memoryTests = sessions
    .map((s: any) => s.memory_tests?.[0])
    .filter(Boolean)

  const baselineMemoryRecallPct = memoryTests.length >= 1
    ? memoryTests.reduce((sum: number, m: any) => {
        const total = Number(m.total_words)
        const score = Number(m.score)
        return sum + (total > 0 ? (score / total) * 100 : 0)
      }, 0) / 1
    : null

  const { error } = await supabase
    .from('baseline_tracking')
    .insert({
      user_id: userId,
      baseline_session_ids: sessionIds,
      baseline_median_rt_ms: baselineMedianRt,
      baseline_std_dev_ms: baselineStdDev,
      baseline_speech_activity: baselineSpeechActivity,
      baseline_avg_pause_ms: baselineAvgPause,
      baseline_wpm: baselineWpm,
      baseline_memory_recall_pct: baselineMemoryRecallPct,
      is_current: true,
    })

  if (error) console.error('Failed to create baseline:', error)
}

async function computeSessionDeltas(sessionId: string, userId: string) {
  const supabase = createClient()

  const { data: baseline } = await supabase
    .from('baseline_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('is_current', true)
    .single()

  if (!baseline) {
    return
  }

  const { data: session } = await supabase
    .from('sessions')
    .select(`
      id,
      reaction_metrics(median_rt_ms, std_dev_ms),
      speech_metrics(speech_activity_ratio, avg_pause_length_ms, words_per_minute),
      memory_tests(score, total_words)
    `)
    .eq('id', sessionId)
    .single()

  if (!session) {
    return
  }

  const reactionMetric = (session as any).reaction_metrics?.[0]
  const speechMetric = (session as any).speech_metrics?.[0]
  const memoryTest = (session as any).memory_tests?.[0]

  // Reaction time deltas
  let reactionMedianDelta = null
  let reactionMedianDeltaPct = null
  let reactionVariabilityDelta = null

  if (reactionMetric && baseline.baseline_median_rt_ms) {
    reactionMedianDelta = Number(reactionMetric.median_rt_ms) - Number(baseline.baseline_median_rt_ms)
    reactionMedianDeltaPct = (reactionMedianDelta / Number(baseline.baseline_median_rt_ms)) * 100
    reactionVariabilityDelta = Number(reactionMetric.std_dev_ms) - Number(baseline.baseline_std_dev_ms)
  }

  // Speech deltas
  let speechActivityDelta = null
  let speechActivityDeltaPct = null
  let speechWpmDeltaPct = null
  let speechPauseDeltaPct = null

  if (speechMetric && baseline.baseline_speech_activity) {
    speechActivityDelta = Number(speechMetric.speech_activity_ratio) - Number(baseline.baseline_speech_activity)
    speechActivityDeltaPct = (speechActivityDelta / Number(baseline.baseline_speech_activity)) * 100
  }

  if (speechMetric && baseline.baseline_wpm) {
    const wpmDelta = Number(speechMetric.words_per_minute || 0) - Number(baseline.baseline_wpm)
    speechWpmDeltaPct = (wpmDelta / Number(baseline.baseline_wpm)) * 100
  }

  if (speechMetric && baseline.baseline_avg_pause_ms) {
    const pauseDelta = Number(speechMetric.avg_pause_length_ms || 0) - Number(baseline.baseline_avg_pause_ms)
    speechPauseDeltaPct = (pauseDelta / Number(baseline.baseline_avg_pause_ms)) * 100
  }

  // Memory delta
  let memoryRecallDeltaPct = null

  if (memoryTest && baseline.baseline_memory_recall_pct) {
    const currentRecallPct = Number(memoryTest.total_words) > 0
      ? (Number(memoryTest.score) / Number(memoryTest.total_words)) * 100
      : 0
    memoryRecallDeltaPct = ((currentRecallPct - Number(baseline.baseline_memory_recall_pct)) / Number(baseline.baseline_memory_recall_pct)) * 100
  }

  // Calculate weighted performance score (0-100)
  // 100 = baseline performance or better
  // < 100 = worse than baseline (proportional to how much worse)
  let weightedScore = null

  if (reactionMetric && baseline.baseline_median_rt_ms) {
    // Reaction score (50% weight): slower RT = worse performance
    const currentRT = Number(reactionMetric.median_rt_ms)
    const baselineRT = Number(baseline.baseline_median_rt_ms)
    // If faster or equal to baseline: 1.0, if slower: ratio (e.g., 300/400 = 0.75)
    const rtScore = currentRT <= baselineRT ? 1 : Math.max(0, baselineRT / currentRT)

    const currentStdDev = Number(reactionMetric.std_dev_ms)
    const baselineStdDev = Number(baseline.baseline_std_dev_ms)
    // If less variable or equal to baseline: 1.0, if more variable: ratio
    const variabilityScore = currentStdDev <= baselineStdDev ? 1 : Math.max(0, baselineStdDev / currentStdDev)

    const reactionScore = (rtScore + variabilityScore) / 2

    // Speech score (30% weight): higher WPM is better, shorter pauses are better
    let speechScore = 1.0 // Default to baseline if no speech data

    if (speechMetric && baseline.baseline_wpm && baseline.baseline_avg_pause_ms) {
      const currentWpm = Number(speechMetric.words_per_minute || 0)
      const baselineWpm = Number(baseline.baseline_wpm)
      // If WPM >= baseline: 1.0, if lower: ratio (e.g., 100/120 = 0.83)
      const wpmScore = currentWpm >= baselineWpm ? 1 : (baselineWpm > 0 ? Math.max(0, currentWpm / baselineWpm) : 1.0)

      const currentPause = Number(speechMetric.avg_pause_length_ms || 0)
      const baselinePause = Number(baseline.baseline_avg_pause_ms)
      // If pauses <= baseline: 1.0, if longer: ratio (e.g., 200/300 = 0.67)
      const pauseScore = currentPause <= baselinePause ? 1 : (currentPause > 0 ? Math.max(0, baselinePause / currentPause) : 1.0)

      speechScore = (wpmScore + pauseScore) / 2
    }

    // Memory score (20% weight): higher recall % is better
    let memoryScore = 1.0 // Default to baseline if no memory data

    if (memoryTest && baseline.baseline_memory_recall_pct) {
      const currentRecallPct = Number(memoryTest.total_words) > 0
        ? (Number(memoryTest.score) / Number(memoryTest.total_words)) * 100
        : 0
      const baselineRecallPct = Number(baseline.baseline_memory_recall_pct)
      // If recall >= baseline: 1.0, if lower: ratio (e.g., 60%/80% = 0.75)
      memoryScore = currentRecallPct >= baselineRecallPct ? 1 : (baselineRecallPct > 0 ? Math.max(0, currentRecallPct / baselineRecallPct) : 1.0)
    }

    // Weighted combination: capped at 100 (baseline or better = 100)
    const rawScore = (0.5 * reactionScore + 0.3 * speechScore + 0.2 * memoryScore) * 100
    weightedScore = Math.min(100, rawScore)
  }

  const { error } = await supabase
    .from('session_deltas')
    .insert({
      session_id: sessionId,
      baseline_id: baseline.id,
      reaction_median_delta_ms: reactionMedianDelta,
      reaction_median_delta_pct: reactionMedianDeltaPct,
      reaction_variability_delta_ms: reactionVariabilityDelta,
      speech_activity_delta: speechActivityDelta,
      speech_activity_delta_pct: speechActivityDeltaPct,
      speech_wpm_delta_pct: speechWpmDeltaPct,
      speech_pause_delta_pct: speechPauseDeltaPct,
      memory_recall_delta_pct: memoryRecallDeltaPct,
      weighted_score: weightedScore,
    })

  if (error) console.error('Failed to compute deltas:', error)
}

export async function checkRecentSessions() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { hasRecent: false, count: 0 }
  }

  const twelveHoursAgo = new Date()
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12)

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', twelveHoursAgo.toISOString())

  if (error) throw error

  return {
    hasRecent: (sessions?.length || 0) > 0,
    count: sessions?.length || 0,
  }
}
