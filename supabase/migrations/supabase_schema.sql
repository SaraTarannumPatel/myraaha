-- MyRaaha Supabase Database and Storage Schema Setup Script
-- Paste this script into the Supabase SQL Editor (https://supabase.com) and click "Run".

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- A. Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- B. Contact Submissions Table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('general', 'partnership', 'incubation', 'other')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- C. Insights Submissions (Write for MyRaaha) Table
CREATE TABLE IF NOT EXISTS public.insights_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Industry Analysis', 'Success Stories', 'Research', 'Events')),
    author_name TEXT NOT NULL,
    author_title TEXT,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- D. Career Applications Table
CREATE TABLE IF NOT EXISTS public.career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id TEXT NOT NULL,
    role_title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    linkedin_url TEXT,
    resume_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'contacted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==========================================
-- 2. Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Define Policies (Access Control)
-- ==========================================

-- Newsletter Subscriptions Policies
DROP POLICY IF EXISTS "Allow anonymous newsletter signups" ON public.newsletter_subscriptions;
CREATE POLICY "Allow anonymous newsletter signups" ON public.newsletter_subscriptions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Contact Submissions Policies
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON public.contact_submissions;
CREATE POLICY "Allow anonymous contact form submissions" ON public.contact_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Insights Submissions Policies
DROP POLICY IF EXISTS "Allow anonymous insights submissions" ON public.insights_submissions;
CREATE POLICY "Allow anonymous insights submissions" ON public.insights_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow public to read approved insights for live display
DROP POLICY IF EXISTS "Allow public read of approved insights" ON public.insights_submissions;
CREATE POLICY "Allow public read of approved insights" ON public.insights_submissions
    FOR SELECT TO public
    USING (status = 'approved');

-- Career Applications Policies
DROP POLICY IF EXISTS "Allow anonymous career applications" ON public.career_applications;
CREATE POLICY "Allow anonymous career applications" ON public.career_applications
    FOR INSERT TO anon
    WITH CHECK (true);

-- ==========================================
-- 4. Create and Configure Storage Buckets
-- ==========================================

-- A. Create the insight-covers Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('insight-covers', 'insight-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Grant access policies for 'insight-covers' bucket
DROP POLICY IF EXISTS "Allow public uploads to insight-covers" ON storage.objects;
CREATE POLICY "Allow public uploads to insight-covers" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'insight-covers');

DROP POLICY IF EXISTS "Allow public read access to insight-covers" ON storage.objects;
CREATE POLICY "Allow public read access to insight-covers" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'insight-covers');

-- B. Create the resumes Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Grant access policies for 'resumes' bucket
DROP POLICY IF EXISTS "Allow public uploads to resumes" ON storage.objects;
CREATE POLICY "Allow public uploads to resumes" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Allow public read access to resumes" ON storage.objects;
CREATE POLICY "Allow public read access to resumes" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'resumes');
