-- Fix for user registration issues
-- Run this SQL in Supabase SQL Editor to resolve "Database error saving new user"

-- First, let's check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles table when a new user is created
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also create a function to manually create profiles for existing users
CREATE OR REPLACE FUNCTION create_profile_for_user(user_id UUID, first_name TEXT DEFAULT '', last_name TEXT DEFAULT '')
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, created_at)
    VALUES (user_id, first_name, last_name, NOW())
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_profile_for_user(UUID, TEXT, TEXT) TO authenticated;

-- Make sure the profiles table has the correct permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Check if there are any existing auth.users without profiles and create them
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, raw_user_meta_data
        FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        INSERT INTO public.profiles (id, first_name, last_name, created_at)
        VALUES (
            user_record.id,
            COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
            COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END
$$;