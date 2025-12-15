-- Update baseline tracking to require only 1 session instead of 3
-- Drop the old constraint
ALTER TABLE baseline_tracking DROP CONSTRAINT IF EXISTS three_baseline_sessions;

-- Add new constraint for 1 session
ALTER TABLE baseline_tracking ADD CONSTRAINT one_baseline_session CHECK (array_length(baseline_session_ids, 1) = 1);
