-- Add word_confirmed_at column to commitments table
-- This tracks when the user clicked "I give my word" after payment
-- Part of Proposal 1: Psychological Commitment Seal

ALTER TABLE commitments
ADD COLUMN IF NOT EXISTS word_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN commitments.word_confirmed_at IS 'Timestamp when user confirmed their commitment by clicking "I give my word" after payment. Part of psychological binding feature.';
