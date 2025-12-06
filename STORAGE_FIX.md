# Storage Upload Fix

## The Issue
You're getting a **403 Unauthorized** error when uploading images because the Supabase storage bucket doesn't have the proper Row Level Security (RLS) policies configured.

## Quick Fix Steps

### 1. Run Storage Policies SQL
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `storage_policies.sql`
5. Click **Run**
6. Wait for "Success" message

### 2. Verify Bucket Creation
1. Go to **Storage** in your Supabase dashboard
2. You should see an `avatars` bucket
3. If not, create it manually:
   - Click **Create bucket**
   - Name: `avatars`
   - Public: **Yes**
   - Click **Save**

### 3. Test Upload
1. Go back to your application
2. Sign in and go to **Profile**
3. Try uploading a profile photo
4. It should work now!

## What the Fix Does

The `storage_policies.sql` file:
- Creates the `avatars` bucket with proper settings
- Sets up RLS policies to allow authenticated users to upload files
- Allows public access to view uploaded images
- Restricts users to only upload/modify their own files

## File Structure
After the fix, uploaded files will be stored as:
```
avatars/
├── user-id-1/
│   └── user-id-1.jpg
├── user-id-2/
│   └── user-id-2.png
└── ...
```

This ensures each user can only access their own files while allowing public viewing of profile photos.

## Alternative Simple Fix
If the main storage policies don't work, uncomment and run the simpler policies at the bottom of `storage_policies.sql`. These are less restrictive but will get file uploads working quickly.