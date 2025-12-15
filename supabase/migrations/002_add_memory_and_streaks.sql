-- Memory test tracking
CREATE TABLE memory_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_sequence JSONB NOT NULL,
  user_recall TEXT,
  score INTEGER NOT NULL,
  total_words INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_tests_session ON memory_tests(session_id);

-- Enable RLS
ALTER TABLE memory_tests ENABLE ROW LEVEL SECURITY;

-- RLS policies for memory_tests
CREATE POLICY "Users can view own memory tests"
  ON memory_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = memory_tests.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own memory tests"
  ON memory_tests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = memory_tests.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- User streaks tracking
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_test_date DATE,
  week_start_date DATE, -- Start of current week
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_streaks
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID, p_test_date DATE)
RETURNS VOID AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_test_date DATE;
  v_week_start DATE;
  v_last_week_start DATE;
BEGIN
  -- Get current streak data
  SELECT current_streak, longest_streak, last_test_date, week_start_date
  INTO v_current_streak, v_longest_streak, v_last_test_date, v_last_week_start
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Calculate week start (Monday)
  v_week_start := p_test_date - ((EXTRACT(DOW FROM p_test_date)::INTEGER + 6) % 7);

  IF v_current_streak IS NULL THEN
    -- First time user
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_test_date, week_start_date)
    VALUES (p_user_id, 1, 1, p_test_date, v_week_start);
  ELSIF v_last_week_start IS NULL OR v_week_start = v_last_week_start THEN
    -- Same week - no streak change, just update last test date
    UPDATE user_streaks
    SET last_test_date = p_test_date,
        week_start_date = v_week_start,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF v_week_start = v_last_week_start + 7 THEN
    -- Consecutive week - increment streak
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_current_streak, v_longest_streak);

    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_test_date = p_test_date,
        week_start_date = v_week_start,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Missed week(s) - reset streak
    UPDATE user_streaks
    SET current_streak = 1,
        longest_streak = v_longest_streak,
        last_test_date = p_test_date,
        week_start_date = v_week_start,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
