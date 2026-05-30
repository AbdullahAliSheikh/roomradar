ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS boosted boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_ads_boosted_created ON public.ads (boosted DESC, created_at DESC);