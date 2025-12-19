export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  consent_version: string
  consent_timestamp: string
  locale: string
  timezone: string
  audio_storage_enabled: boolean
}

export interface Session {
  id: string
  user_id: string
  created_at: string
  completed_at: string | null
  version: string
  client_context_hash: string | null
  focus_loss_count: number
  speech_skipped: boolean
  is_baseline_eligible: boolean
  quality_flags: Record<string, any>
}

export interface ReactionTrial {
  id: string
  session_id: string
  trial_index: number
  is_practice: boolean
  random_delay_ms: number
  stimulus_timestamp: string
  response_timestamp: string | null
  reaction_time_ms: number | null
  early_click_count: number
  focus_lost: boolean
  input_method: string
  created_at: string
}

export interface ReactionMetrics {
  id: string
  session_id: string
  median_rt_ms: number
  mean_rt_ms: number
  std_dev_ms: number
  outlier_count: number
  valid_trial_count: number
  total_trial_count: number
  computed_at: string
}

export interface SpeechData {
  id: string
  session_id: string
  prompt_id: string
  completion_status: 'pending' | 'completed' | 'skipped' | 'failed'
  duration_ms: number | null
  redo_used: boolean
  audio_storage_url: string | null
  recorded_at: string | null
  created_at: string
}

export interface SpeechMetrics {
  id: string
  session_id: string
  voiced_time_ms: number | null
  pause_time_ms: number | null
  pause_count: number
  avg_pause_length_ms: number | null
  speech_activity_ratio: number | null
  word_count: number | null
  words_per_minute: number | null
  computed_at: string
}

export interface MemoryTest {
  id: string
  session_id: string
  word_sequence: string[]
  user_recall: string | null
  score: number
  total_words: number
  created_at: string
}

export interface BaselineTracking {
  id: string
  user_id: string
  baseline_session_ids: string[]
  baseline_median_rt_ms: number | null
  baseline_std_dev_ms: number | null
  baseline_speech_activity: number | null
  established_at: string
  is_current: boolean
}

export interface SessionDelta {
  id: string
  session_id: string
  baseline_id: string
  reaction_median_delta_ms: number | null
  reaction_median_delta_pct: number | null
  reaction_variability_delta_ms: number | null
  speech_activity_delta: number | null
  speech_activity_delta_pct: number | null
  weighted_score: number | null
  computed_at: string
}

export interface SessionWithMetrics extends Session {
  reaction_metrics?: ReactionMetrics[]
  speech_metrics?: SpeechMetrics[]
  memory_tests?: MemoryTest[]
  session_deltas?: SessionDelta[]
}

export interface DashboardData {
  sessions: SessionWithMetrics[]
  baseline: BaselineTracking | null
  latestSession: SessionWithMetrics | null
}
