-- ============================================================
-- Luxe Beauty Performance Management System
-- Supabase SQL Setup Script
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── MARKETERS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       TEXT NOT NULL,
  target_tiktok   INTEGER NOT NULL DEFAULT 15,
  target_instagram INTEGER NOT NULL DEFAULT 15,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ACCOUNTS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name  TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  marketer_id   UUID NOT NULL REFERENCES public.marketers(id) ON DELETE CASCADE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── DAILY REPORTS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date         DATE NOT NULL,
  marketer_id         UUID NOT NULL REFERENCES public.marketers(id) ON DELETE CASCADE,
  account_id          UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  morning_tiktok      INTEGER NOT NULL DEFAULT 0,
  morning_instagram   INTEGER NOT NULL DEFAULT 0,
  scheduled_tiktok    INTEGER NOT NULL DEFAULT 0,
  scheduled_instagram INTEGER NOT NULL DEFAULT 0,
  image_designs       INTEGER NOT NULL DEFAULT 0,
  ai_videos           INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_accounts_marketer_id ON public.accounts(marketer_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_marketer_id ON public.daily_reports(marketer_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_account_id ON public.daily_reports(account_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON public.daily_reports(report_date);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.marketers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow authenticated full access to marketers"
  ON public.marketers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to accounts"
  ON public.accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to daily_reports"
  ON public.daily_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── SEED SAMPLE DATA (optional) ──────────────────────────────
-- Uncomment below to add sample data for testing

/*
INSERT INTO public.marketers (full_name, target_tiktok, target_instagram) VALUES
  ('Sarah Ahmed', 15, 15),
  ('Mohamed Hassan', 15, 15),
  ('Nour Khalil', 15, 15);

INSERT INTO public.accounts (account_name, platform, marketer_id)
SELECT 'luxebeauty_official', 'tiktok', id FROM public.marketers WHERE full_name = 'Sarah Ahmed';

INSERT INTO public.accounts (account_name, platform, marketer_id)
SELECT 'luxebeauty_ig', 'instagram', id FROM public.marketers WHERE full_name = 'Sarah Ahmed';
*/
