-- Setup SQL for Supabase Database
-- Run this in the Supabase SQL Editor to set up your tables, storage, and Row Level Security (RLS) policies.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create stories table
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  content text,
  cover_image text,
  date date default current_date,
  published boolean default false,
  type text default 'blog',
  slug text unique,
  location text,
  industry text,
  featured boolean default false,
  testimonial_quote text,
  testimonial_author text,
  testimonial_company text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on stories
alter table public.stories enable row level security;

-- Create policies for stories table
-- 1. Allow public read access to published stories
create policy "Allow public read access to published stories"
  on public.stories for select
  using (published = true);

-- 2. Allow authenticated users to view all of their own stories (drafts & published)
create policy "Allow users to view their own stories"
  on public.stories for select
  using (auth.uid() = user_id);

-- 3. Allow authenticated users to insert their own stories
create policy "Allow users to insert their own stories"
  on public.stories for insert
  with check (auth.uid() = user_id);

-- 4. Allow authenticated users to update their own stories
create policy "Allow users to update their own stories"
  on public.stories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Allow authenticated users to delete their own stories
create policy "Allow users to delete their own stories"
  on public.stories for delete
  using (auth.uid() = user_id);


-- Create Storage Bucket for Images
-- Note: Buckets can be created via Supabase Dashboard, but this SQL ensures the bucket exists and policies are set.
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up storage policies for the 'images' bucket
-- 1. Allow public access to read files
create policy "Allow public read access to images"
  on storage.objects for select
  using (bucket_id = 'images');

-- 2. Allow authenticated users to upload files
create policy "Allow authenticated uploads to images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');

-- 3. Allow authenticated users to update files
create policy "Allow authenticated updates to images"
  on storage.objects for update
  using (bucket_id = 'images' and auth.role() = 'authenticated');

-- 4. Allow authenticated users to delete files
create policy "Allow authenticated deletions from images"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.role() = 'authenticated');
