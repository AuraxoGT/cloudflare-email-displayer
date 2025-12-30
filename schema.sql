-- Create table for storing AI-processed emails
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    body_raw TEXT,
    service_name TEXT,
    brand_color VARCHAR(10),
    otp_code VARCHAR(50),
    action_link TEXT,
    action_label VARCHAR(100),
    is_otp BOOLEAN DEFAULT FALSE,
    is_ai_result BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(50),
    ai_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster retrieval of newest emails
CREATE INDEX idx_emails_created_at ON emails (created_at DESC);
