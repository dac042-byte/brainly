-- Add missing baseline metrics for speech and memory
ALTER TABLE baseline_tracking
  ADD COLUMN baseline_avg_pause_ms NUMERIC(10, 2),
  ADD COLUMN baseline_wpm NUMERIC(10, 2),
  ADD COLUMN baseline_memory_recall_pct NUMERIC(5, 2);

-- Add memory delta tracking to session_deltas
ALTER TABLE session_deltas
  ADD COLUMN memory_recall_delta_pct NUMERIC(5, 2),
  ADD COLUMN speech_wpm_delta_pct NUMERIC(5, 2),
  ADD COLUMN speech_pause_delta_pct NUMERIC(5, 2),
  ADD COLUMN weighted_score NUMERIC(5, 2);

-- Add comment explaining weighted_score
COMMENT ON COLUMN session_deltas.weighted_score IS 'Combined performance score (0-100): 50% reaction, 30% speech, 20% memory';
