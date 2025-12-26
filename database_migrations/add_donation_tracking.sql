-- Add donation tracking columns to payments table
-- For manual donation processing workflow

ALTER TABLE payments
ADD COLUMN donation_processed_at TIMESTAMP,
ADD COLUMN donation_processed_by VARCHAR(255),
ADD COLUMN donation_batch_id VARCHAR(100),
ADD COLUMN donation_receipt_url TEXT,
ADD COLUMN donation_notes TEXT;

-- Add comments
COMMENT ON COLUMN payments.donation_processed_at IS 'Timestamp when admin manually processed the donation';
COMMENT ON COLUMN payments.donation_processed_by IS 'Email of admin who processed the donation';
COMMENT ON COLUMN payments.donation_batch_id IS 'Batch ID for grouping donations processed together (e.g., "2025-12-monthly")';
COMMENT ON COLUMN payments.donation_receipt_url IS 'URL/path to charity donation receipt for transparency';
COMMENT ON COLUMN payments.donation_notes IS 'Admin notes about the donation (charity confirmation #, etc)';

-- Create index for faster queries on pending donations
CREATE INDEX idx_payments_donation_status ON payments(status, donation_processed_at);
CREATE INDEX idx_payments_donation_batch ON payments(donation_batch_id);
