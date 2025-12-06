-- Storage Policies for Doctor Clinic Token Management
-- Run this SQL in Supabase SQL Editor to enable file uploads

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload their own avatar
-- Users can only upload files named with their user ID
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

-- Policy: Allow public read access to avatars
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Alternative simpler policies (use if the above doesn't work)
-- DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;  
-- DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- Simple upload policy for authenticated users
-- CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'avatars' 
--   AND auth.role() = 'authenticated'
-- );

-- Simple update policy for authenticated users  
-- CREATE POLICY "Authenticated users can update avatars" ON storage.objects
-- FOR UPDATE USING (
--   bucket_id = 'avatars' 
--   AND auth.role() = 'authenticated'
-- );

-- Simple delete policy for authenticated users
-- CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'avatars' 
--   AND auth.role() = 'authenticated'
-- );

-- Public read access
-- CREATE POLICY "Public can view avatars" ON storage.objects
-- FOR SELECT USING (bucket_id = 'avatars');