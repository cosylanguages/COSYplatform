-- Migration 0004: Fix Infinite Recursion in Profiles RLS Policy
--
-- The policy "Founders can read all profiles" in 0001_core_profiles_and_lessons.sql
-- queried public.profiles directly within a policy defined ON public.profiles.
-- This caused infinite recursion whenever a SELECT query evaluated the policy.
--
-- Solution: Encapsulate the role check inside a SECURITY DEFINER function
-- (public.is_founder()) which executes with founder privileges and bypasses RLS
-- checks on public.profiles, preventing policy recursion loops.

CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'founder'
  );
$$;

DROP POLICY IF EXISTS "Founders can read all profiles" ON public.profiles;

CREATE POLICY "Founders can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_founder());
