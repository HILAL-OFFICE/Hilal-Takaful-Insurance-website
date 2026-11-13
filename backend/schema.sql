-- ==============================================================================
-- HILAL TAKAFUL INSURANCE LIMITED - SUPABASE DATABASE SCHEMA & MIGRATIONS
-- ==============================================================================
-- Paste this entire SQL file into your Supabase SQL Editor and click "RUN".
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. SITE SETTINGS TABLE (Branding, Contacts, Header/Footer Details)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL DEFAULT 'Hilal Takaful Insurance Limited',
    rc_number TEXT DEFAULT 'RC 1309373',
    phone_primary TEXT DEFAULT '+234 907 682 4451',
    phone_secondary TEXT DEFAULT '',
    email_enquiries TEXT DEFAULT 'enquiries@hilaltakaful.com.ng',
    email_customer_service TEXT DEFAULT 'hilaltakafulcustomerservice@hilaltakaful.com.ng',
    address_line TEXT DEFAULT 'Plot A2, Hakeem Balogun Street, CBD NECA House, Alausa, Ikeja, Lagos, Nigeria.',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/HilalTakafulNg',
    twitter_url TEXT DEFAULT 'https://x.com/hilaltakafulng',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/hilaltakafulng',
    linkedin_url TEXT DEFAULT 'https://www.linkedin.com/company/hilal-takaful-nigeria',
    hero_title TEXT DEFAULT 'Protect Your Future .',
    hero_subtitle TEXT DEFAULT 'Nigeria''s pioneer composite Takaful operator offering ethical, Shariah-compliant General and Family insurance solutions with annual underwriting surplus sharing.',
    milestones JSONB DEFAULT '[
        {"label": "Pioneered in Nigeria", "value": "2010"},
        {"label": "Shariah Compliant", "value": "100%"},
        {"label": "Licensed & Certified", "value": "NAICOM"}
    ]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial site_settings if empty
INSERT INTO public.site_settings (id)
SELECT 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- ------------------------------------------------------------------------------
-- 2. TEAM MEMBERS (Board of Directors, Management Team, Advisory Council)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    honorifics TEXT DEFAULT '', -- e.g. "mni", "FCA", "MCIHRM"
    role TEXT NOT NULL,         -- e.g. "Managing Director", "Non-Executive Director"
    category TEXT NOT NULL CHECK (category IN ('board', 'management', 'advisory')),
    sub_title TEXT DEFAULT '',  -- badge subtitle e.g. "Public & Private Sector Governance Expert"
    bio_snippet TEXT DEFAULT '',
    bio_full TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS & SOLUTIONS (General & Family Takaful)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('general', 'family')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT DEFAULT '',
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb, -- Array of string bullet points
    target_audience TEXT DEFAULT '',
    brochure_url TEXT DEFAULT '',
    icon_class TEXT DEFAULT 'bi-shield-check',
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BLOG & NEWS POSTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    featured_image TEXT DEFAULT '',
    category TEXT DEFAULT 'Takaful Insights',
    author_name TEXT DEFAULT 'Hilal Takaful Team',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. EVENT GALLERY (Albums & Photos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_date DATE DEFAULT CURRENT_DATE,
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    cover_image_url TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs with optional captions
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. FINANCIAL & ANNUAL REPORTS (Investors Relation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'annual_report' CHECK (category IN ('annual_report', 'shariah_report', 'quarterly_statement')),
    file_url TEXT NOT NULL,
    file_size TEXT DEFAULT '',
    published_date DATE DEFAULT CURRENT_DATE,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CUSTOMER INQUIRIES & QUOTE REQUESTS (From Contact Us / Forms)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    service_type TEXT DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Anonymous website visitors can read published content)
CREATE POLICY "Public can view site settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Public can view active team members"
    ON public.team_members FOR SELECT
    USING (is_active = true);

CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Public can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Public can view active gallery events"
    ON public.gallery_events FOR SELECT
    USING (is_active = true);

CREATE POLICY "Public can view active financial reports"
    ON public.financial_reports FOR SELECT
    USING (is_active = true);

-- PUBLIC INSERT POLICY (Website visitors can submit inquiries)
CREATE POLICY "Public can submit inquiries"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

-- AUTHENTICATED ADMIN POLICIES (Admins can perform all CRUD operations)
CREATE POLICY "Admins full access to site_settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins full access to team_members"
    ON public.team_members FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins full access to products"
    ON public.products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins full access to blog_posts"
    ON public.blog_posts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins full access to gallery_events"
    ON public.gallery_events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins full access to financial_reports"
    ON public.financial_reports FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins full access to inquiries"
    ON public.inquiries FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 9. SUPABASE STORAGE BUCKETS SETUP
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('team-avatars', 'team-avatars', true),
    ('blog-images', 'blog-images', true),
    ('gallery-images', 'gallery-images', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view assets
CREATE POLICY "Public Access for team-avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'team-avatars');

CREATE POLICY "Public Access for blog-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog-images');

CREATE POLICY "Public Access for gallery-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery-images');

CREATE POLICY "Public Access for documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');

-- Storage RLS: Authenticated users can upload/modify
CREATE POLICY "Admins can upload storage objects"
    ON storage.objects FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

