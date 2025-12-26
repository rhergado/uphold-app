-- Add refund tracking columns to payments table
-- Run this in Supabase SQL Editor

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_refund_id ON payments(refund_id);
CREATE INDEX IF NOT EXISTS idx_payments_refund_date ON payments(refund_date);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments'
AND column_name IN ('refund_id', 'refund_amount', 'refund_date');
