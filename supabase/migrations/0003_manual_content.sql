-- Migration 0003: Manual Content Schema
-- Ported from COSYmanuals schema (scripts/schema.sql)

-- Create `manual_content` table storing full Markdown manuals
CREATE TABLE IF NOT EXISTS public.manual_content (
  manual_id TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.manual_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-applying
DROP POLICY IF EXISTS "Authenticated users can read manual content" ON public.manual_content;
DROP POLICY IF EXISTS "Service role can manage manual content" ON public.manual_content;

-- Read policy: Authenticated users can select manual content
CREATE POLICY "Authenticated users can read manual content"
  ON public.manual_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin / Service role full access policy
CREATE POLICY "Service role can manage manual content"
  ON public.manual_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
