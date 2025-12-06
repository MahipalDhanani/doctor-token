-- Doctor Clinic Token Management Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table: extends auth.users with additional profile information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  mobile TEXT,
  profile_photo_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens table: active token bookings for a given day
CREATE TABLE tokens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_number INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  address TEXT,
  booked_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table: clinic-level settings
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinic meta table: store current token, doctor availability and daily limit
CREATE TABLE clinic_meta (
  id SERIAL PRIMARY KEY,
  meta_date DATE NOT NULL UNIQUE,
  current_token INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 50,
  doctor_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking logs table: track all token-related actions for audit
CREATE TABLE booking_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_id BIGINT REFERENCES tokens(id),
  action TEXT NOT NULL, -- 'created', 'advanced', 'cancelled', etc.
  performed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tokens_booking_date ON tokens(booking_date);
CREATE INDEX idx_tokens_user_id ON tokens(user_id);
CREATE INDEX idx_tokens_token_number ON tokens(token_number);
CREATE UNIQUE INDEX idx_clinic_meta_date ON clinic_meta(meta_date);
CREATE INDEX idx_booking_logs_token_id ON booking_logs(token_id);
CREATE INDEX idx_booking_logs_performed_by ON booking_logs(performed_by);

-- Create a unique constraint to prevent duplicate bookings per user per day
CREATE UNIQUE INDEX idx_tokens_user_date_unique ON tokens(user_id, booking_date) 
WHERE user_id IS NOT NULL;

-- Insert initial clinic metadata for today
INSERT INTO clinic_meta (meta_date, current_token, daily_limit, doctor_available)
VALUES (CURRENT_DATE, 0, 50, FALSE)
ON CONFLICT (meta_date) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('clinic_name', 'Your Clinic Name', 'Name of the clinic'),
('clinic_phone', '+91-1234567890', 'Contact phone number'),
('notification_sound_url', '', 'URL for token change notification sound'),
('max_tokens_per_day', '50', 'Default maximum tokens per day'),
('auto_cleanup_enabled', 'true', 'Enable automatic daily cleanup of old tokens')
ON CONFLICT (key) DO NOTHING;

-- Function to get next available token number for a given date
CREATE OR REPLACE FUNCTION get_next_token_number(target_date DATE)
RETURNS INTEGER AS $$
DECLARE
    next_token INTEGER;
BEGIN
    SELECT COALESCE(MAX(token_number), 0) + 1 
    INTO next_token 
    FROM tokens 
    WHERE booking_date = target_date;
    
    RETURN next_token;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old tokens (for daily cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_tokens()
RETURNS VOID AS $$
BEGIN
    -- Delete tokens older than today
    DELETE FROM tokens WHERE booking_date < CURRENT_DATE;
    
    -- Update or insert today's clinic meta
    INSERT INTO clinic_meta (meta_date, current_token, daily_limit, doctor_available)
    VALUES (CURRENT_DATE, 0, 50, FALSE)
    ON CONFLICT (meta_date) 
    DO UPDATE SET current_token = 0, updated_at = NOW();
    
    -- Log the cleanup action
    INSERT INTO booking_logs (action, note, created_at)
    VALUES ('daily_cleanup', 'Automatic cleanup of old tokens', NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to advance current token
CREATE OR REPLACE FUNCTION advance_current_token()
RETURNS INTEGER AS $$
DECLARE
    new_token INTEGER;
BEGIN
    UPDATE clinic_meta 
    SET current_token = current_token + 1, updated_at = NOW()
    WHERE meta_date = CURRENT_DATE
    RETURNING current_token INTO new_token;
    
    IF new_token IS NULL THEN
        -- Insert if no record exists for today
        INSERT INTO clinic_meta (meta_date, current_token, daily_limit, doctor_available)
        VALUES (CURRENT_DATE, 1, 50, FALSE)
        RETURNING current_token INTO new_token;
    END IF;
    
    -- Log the token advance
    INSERT INTO booking_logs (action, note, created_at)
    VALUES ('token_advanced', 'Token advanced to ' || new_token, NOW());
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_meta_updated_at BEFORE UPDATE ON clinic_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for current day token information
CREATE OR REPLACE VIEW current_day_tokens AS
SELECT 
    t.*,
    cm.current_token,
    cm.daily_limit,
    cm.doctor_available,
    (t.token_number <= cm.current_token) as is_completed
FROM tokens t
CROSS JOIN clinic_meta cm
WHERE t.booking_date = CURRENT_DATE 
AND cm.meta_date = CURRENT_DATE
ORDER BY t.token_number;

-- Create a view for next 10 tokens
CREATE OR REPLACE VIEW next_ten_tokens AS
SELECT 
    t.*
FROM tokens t
CROSS JOIN clinic_meta cm
WHERE t.booking_date = CURRENT_DATE 
AND cm.meta_date = CURRENT_DATE
AND t.token_number > cm.current_token
ORDER BY t.token_number
LIMIT 10;