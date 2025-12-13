-- Braingauge v1 Database Schema
-- Privacy-first cognitive self-tracking with personal baseline only

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
-- Stores minimal user information and privacy settings
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_version TEXT NOT NULL DEFAULT 'v1.0',
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  audio_storage_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT valid_locale CHECK (locale ~ '^[a-z]{2}-[A-Z]{2}$')
);

-- Sessions table
-- Each session represents one completed test attempt
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  version TEXT NOT NULL DEFAULT 'v1.0',
  client_context_hash TEXT,
  focus_loss_count INTEGER DEFAULT 0,
  speech_skipped BOOLEAN NOT NULL DEFAULT FALSE,
  is_baseline_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  quality_flags JSONB DEFAULT '{}'::jsonb
);

-- Reaction time trials table
-- Per-trial raw data for reaction time tests
CREATE TABLE reaction_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  trial_index INTEGER NOT NULL,
  is_practice BOOLEAN NOT NULL DEFAULT FALSE,
  random_delay_ms INTEGER NOT NULL,
  stimulus_timestamp TIMESTAMPTZ NOT NULL,
  response_timestamp TIMESTAMPTZ,
  reaction_time_ms INTEGER,
  early_click_count INTEGER DEFAULT 0,
  focus_lost BOOLEAN DEFAULT FALSE,
  input_method TEXT DEFAULT 'mouse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_trial_index CHECK (trial_index >= 0),
  CONSTRAINT valid_delay CHECK (random_delay_ms >= 1000 AND random_delay_ms <= 3000),
  CONSTRAINT valid_reaction_time CHECK (reaction_time_ms IS NULL OR reaction_time_ms >= 0)
);

-- Reaction metrics table
-- Derived metrics computed from reaction trials per session
CREATE TABLE reaction_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  median_rt_ms NUMERIC(10, 2),
  mean_rt_ms NUMERIC(10, 2),
  std_dev_ms NUMERIC(10, 2),
  outlier_count INTEGER DEFAULT 0,
  valid_trial_count INTEGER NOT NULL,
  total_trial_count INTEGER NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_counts CHECK (valid_trial_count <= total_trial_count)
);

-- Speech data table
-- Per-session speech recording metadata
CREATE TABLE speech_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL DEFAULT 'default_v1',
  completion_status TEXT NOT NULL DEFAULT 'pending',
  duration_ms INTEGER,
  redo_used BOOLEAN DEFAULT FALSE,
  audio_storage_url TEXT,
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0),
  CONSTRAINT valid_status CHECK (completion_status IN ('pending', 'completed', 'skipped', 'failed'))
);

-- Speech metrics table
-- Derived timing metrics from speech recordings
CREATE TABLE speech_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  voiced_time_ms INTEGER,
  pause_time_ms INTEGER,
  pause_count INTEGER DEFAULT 0,
  avg_pause_length_ms NUMERIC(10, 2),
  speech_activity_ratio NUMERIC(5, 4),
  word_count INTEGER,
  words_per_minute NUMERIC(10, 2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_ratio CHECK (speech_activity_ratio IS NULL OR (speech_activity_ratio >= 0 AND speech_activity_ratio <= 1))
);

-- Baseline tracking table
-- Stores baseline definition and per-session deltas
CREATE TABLE baseline_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  baseline_session_ids UUID[] NOT NULL,
  baseline_median_rt_ms NUMERIC(10, 2),
  baseline_std_dev_ms NUMERIC(10, 2),
  baseline_speech_activity NUMERIC(5, 4),
  established_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT three_baseline_sessions CHECK (array_length(baseline_session_ids, 1) = 3)
);

-- Session deltas table
-- Stores change versus baseline for each session
CREATE TABLE session_deltas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  baseline_id UUID NOT NULL REFERENCES baseline_tracking(id) ON DELETE CASCADE,
  reaction_median_delta_ms NUMERIC(10, 2),
  reaction_median_delta_pct NUMERIC(5, 2),
  reaction_variability_delta_ms NUMERIC(10, 2),
  speech_activity_delta NUMERIC(5, 4),
  speech_activity_delta_pct NUMERIC(5, 2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at DESC);
CREATE INDEX idx_reaction_trials_session ON reaction_trials(session_id);
CREATE INDEX idx_reaction_metrics_session ON reaction_metrics(session_id);
CREATE INDEX idx_speech_data_session ON speech_data(session_id);
CREATE INDEX idx_speech_metrics_session ON speech_metrics(session_id);
CREATE INDEX idx_baseline_tracking_user ON baseline_tracking(user_id, is_current);
CREATE INDEX idx_session_deltas_session ON session_deltas(session_id);
CREATE INDEX idx_session_deltas_baseline ON session_deltas(baseline_id);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reaction_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE reaction_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_deltas ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Reaction trials policies
CREATE POLICY "Users can view own reaction trials"
  ON reaction_trials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reaction_trials.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reaction trials"
  ON reaction_trials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reaction_trials.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Reaction metrics policies
CREATE POLICY "Users can view own reaction metrics"
  ON reaction_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reaction_metrics.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reaction metrics"
  ON reaction_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reaction_metrics.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Speech data policies
CREATE POLICY "Users can view own speech data"
  ON speech_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = speech_data.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own speech data"
  ON speech_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = speech_data.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Speech metrics policies
CREATE POLICY "Users can view own speech metrics"
  ON speech_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = speech_metrics.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own speech metrics"
  ON speech_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = speech_metrics.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Baseline tracking policies
CREATE POLICY "Users can view own baseline"
  ON baseline_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own baseline"
  ON baseline_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own baseline"
  ON baseline_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Session deltas policies
CREATE POLICY "Users can view own session deltas"
  ON session_deltas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_deltas.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session deltas"
  ON session_deltas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_deltas.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
