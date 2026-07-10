-- Migration: Add user_id column and setup security policies on existing stories table
-- Run this in your Supabase SQL Editor to migrate your current database.

-- 1. Add user_id column referencing auth.users table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Enable Row Level Security (RLS) on stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist to prevent conflicts, then create them
DROP POLICY IF EXISTS "Allow public read access to published stories" ON public.stories;
DROP POLICY IF EXISTS "Allow users to view their own stories" ON public.stories;
DROP POLICY IF EXISTS "Allow users to insert their own stories" ON public.stories;
DROP POLICY IF EXISTS "Allow users to update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Allow users to delete their own stories" ON public.stories;

-- 4. Create new security policies
-- Allow public read access to published stories
CREATE POLICY "Allow public read access to published stories"
  ON public.stories FOR SELECT
  USING (published = true);

-- Allow authenticated users to view all of their own stories (drafts & published)
CREATE POLICY "Allow users to view their own stories"
  ON public.stories FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own stories
CREATE POLICY "Allow users to insert their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own stories
CREATE POLICY "Allow users to update their own stories"
  ON public.stories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own stories
CREATE POLICY "Allow users to delete their own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);
