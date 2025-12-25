-- Add fee tracking columns to commitments table
-- New pricing model:
-- Success: 5% platform fee, 95% refunded to user
-- Failure: 25% platform fee, 75% donated to charity

ALTER TABLE commitments
ADD COLUMN platform_fee_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN charity_donation_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN refund_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comments to explain the columns
COMMENT ON COLUMN commitments.platform_fee_amount IS 'Platform fee: 5% on success, 25% on failure';
COMMENT ON COLUMN commitments.charity_donation_amount IS 'Amount donated to charity: 0% on success, 75% on failure';
COMMENT ON COLUMN commitments.refund_amount IS 'Amount refunded to user: 95% on success, 0% on failure';
