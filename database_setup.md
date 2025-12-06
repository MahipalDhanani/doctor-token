# Database Setup Guide

This guide will help you set up the Supabase database for the Doctor Clinic Token Management system.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase
3. Note down your project URL and anon key

## Step 1: Create the Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `database_schema.sql`
5. Click "Run" to execute the schema

## Step 2: Set Up Row Level Security

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `rls_policies.sql`
3. Click "Run" to execute the RLS policies

## Step 3: Configure Authentication

### Email Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable email authentication (should be enabled by default)
3. Configure email templates if desired

### Google OAuth (Optional)
1. Go to Authentication > Settings > Auth Providers
2. Enable Google provider
3. Add your Google OAuth client ID and secret
   - Create these at https://console.cloud.google.com/
   - Set authorized redirect URIs to: `https://your-project.supabase.co/auth/v1/callback`

## Step 4: Create Your First Admin User

After setting up the schema and RLS, you need to create an admin user:

1. Register a user through your application (or use Supabase Auth UI)
2. Once registered, run this SQL to make them an admin:

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = 'your-user-uuid-here';
```

You can find the user UUID in Authentication > Users in your Supabase dashboard.

## Step 5: Configure Real-time (Optional)

1. Go to Database > Replication in your Supabase dashboard
2. Enable real-time for the following tables:
   - `tokens`
   - `clinic_meta`
   - `settings`

## Step 6: Set Up Daily Cleanup (Optional)

You have several options for daily cleanup:

### Option 1: Supabase Edge Functions (Recommended)
1. Create an Edge Function that calls `SELECT cleanup_old_tokens();`
2. Use Supabase's cron functionality to schedule it daily at 00:05 IST

### Option 2: External Cron Job
1. Set up a cron job on your server or use GitHub Actions
2. Have it call your Supabase API to execute the cleanup function

### Option 3: Manual Cleanup
Run this SQL query daily at midnight (IST):

```sql
SELECT cleanup_old_tokens();
```

## Step 7: Update Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Verification

To verify your setup is working:

1. Check that all tables exist in Database > Tables
2. Verify RLS is enabled on all tables
3. Test user registration and profile creation
4. Check that the admin user can access admin functions

## Common Issues

### RLS Policies Not Working
- Make sure RLS is enabled on all tables
- Verify the policies are created correctly
- Check that the admin user has `is_admin = TRUE` in the profiles table

### Real-time Not Working
- Enable real-time replication for the required tables
- Check your client-side subscriptions are set up correctly

### Authentication Issues
- Verify your Supabase URL and anon key are correct
- Check that email confirmation is not required (or is properly handled)
- For Google OAuth, ensure redirect URIs are configured correctly

## Security Notes

- Never expose your service role key in client-side code
- Always use the anon key for client-side operations
- RLS policies ensure data security even with the anon key
- Regularly review and audit your RLS policies

## Sample Data (Optional)

You can insert some sample data for testing:

```sql
-- Insert sample settings
INSERT INTO settings (key, value, description) VALUES
('clinic_name', 'Sample Medical Clinic', 'Clinic name for testing'),
('clinic_phone', '+91-9876543210', 'Clinic contact number');

-- Set doctor as available for today
INSERT INTO clinic_meta (meta_date, current_token, daily_limit, doctor_available)
VALUES (CURRENT_DATE, 0, 20, TRUE)
ON CONFLICT (meta_date) 
DO UPDATE SET doctor_available = TRUE, daily_limit = 20;
```