-- Keep CEFR comparisons consistent across legacy courses and Studio catalog seeds.
UPDATE public.courses SET cefr = lower(cefr) WHERE cefr <> lower(cefr);
UPDATE public.lessons SET cefr = lower(cefr) WHERE cefr <> lower(cefr);
