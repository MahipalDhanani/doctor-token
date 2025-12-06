-- Row Level Security (RLS) Policies for Doctor Clinic Token Management
-- Run this SQL after creating the main schema

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile and admins can view all profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile, admins can update any profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Tokens policies
-- Anyone can view tokens (for public token board)
CREATE POLICY "Anyone can view tokens" ON tokens
    FOR SELECT USING (TRUE);

-- Authenticated users can insert tokens for themselves
CREATE POLICY "Users can insert own tokens" ON tokens
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        (user_id = auth.uid() OR booked_by_admin = TRUE)
    );

-- Admins can insert, update, and delete any tokens
CREATE POLICY "Admins can manage all tokens" ON tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Users can only delete their own tokens (within reasonable time)
CREATE POLICY "Users can delete own recent tokens" ON tokens
    FOR DELETE USING (
        auth.uid() = user_id AND 
        booking_date = CURRENT_DATE AND
        created_at > (NOW() - INTERVAL '30 minutes')
    );

-- Settings policies
-- Anyone can view settings (for public display)
CREATE POLICY "Anyone can view settings" ON settings
    FOR SELECT USING (TRUE);

-- Only admins can modify settings
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Clinic meta policies
-- Anyone can view clinic meta (for public token board)
CREATE POLICY "Anyone can view clinic meta" ON clinic_meta
    FOR SELECT USING (TRUE);

-- Only admins can modify clinic meta
CREATE POLICY "Admins can manage clinic meta" ON clinic_meta
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Booking logs policies
-- Admins can view all logs
CREATE POLICY "Admins can view booking logs" ON booking_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Users can view logs related to their tokens
CREATE POLICY "Users can view own token logs" ON booking_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tokens t 
            WHERE t.id = token_id AND t.user_id = auth.uid()
        )
    );

-- System and admins can insert logs
CREATE POLICY "System can insert logs" ON booking_logs
    FOR INSERT WITH CHECK (TRUE);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for functions
GRANT EXECUTE ON FUNCTION get_next_token_number(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION advance_current_token() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_tokens() TO authenticated;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to check if a user can book a token
CREATE OR REPLACE FUNCTION can_user_book_token(user_uuid UUID, target_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    existing_tokens INTEGER;
    daily_limit INTEGER;
    token_count INTEGER;
    doctor_available BOOLEAN;
BEGIN
    -- Check if doctor is available
    SELECT cm.doctor_available, cm.daily_limit
    INTO doctor_available, daily_limit
    FROM clinic_meta cm
    WHERE cm.meta_date = target_date;
    
    IF NOT FOUND OR NOT doctor_available THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user already has a token for this date
    SELECT COUNT(*)
    INTO existing_tokens
    FROM tokens
    WHERE user_id = user_uuid AND booking_date = target_date;
    
    IF existing_tokens > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if daily limit is reached
    SELECT COUNT(*)
    INTO token_count
    FROM tokens
    WHERE booking_date = target_date;
    
    IF token_count >= daily_limit THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION can_user_book_token(UUID, DATE) TO authenticated;