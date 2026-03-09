-- ============================================================
-- NeighborIQ — Supabase Table Definitions
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Crime Incidents
CREATE TABLE IF NOT EXISTS crime_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  neighborhood TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for spatial + time queries
CREATE INDEX IF NOT EXISTS idx_crime_neighborhood ON crime_incidents (neighborhood);
CREATE INDEX IF NOT EXISTS idx_crime_date ON crime_incidents (date DESC);

-- 2. Building Permits
CREATE TABLE IF NOT EXISTS permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  value NUMERIC(12, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permits_date ON permits (date DESC);

-- 3. News Articles
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  sentiment DOUBLE PRECISION DEFAULT 0,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  neighborhood TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_neighborhood ON news_articles (neighborhood);
CREATE INDEX IF NOT EXISTS idx_news_date ON news_articles (date DESC);

-- 4. Reported Issues (311 reports)
CREATE TABLE IF NOT EXISTS reported_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL,
  photo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON reported_issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_created ON reported_issues (created_at DESC);

-- ============================================================
-- Enable Row Level Security (optional — recommended for prod)
-- ============================================================
-- ALTER TABLE crime_incidents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reported_issues ENABLE ROW LEVEL SECURITY;
