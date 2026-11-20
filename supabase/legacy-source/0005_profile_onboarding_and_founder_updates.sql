-- Migration 0005: Automatic Profile Onboarding and Founder UPDATE RLS Policy
--
-- This migration performs four key platform profile management functions:
-- 1. Automatic Onboarding Function (handle_new_user): Creates a default student profile row
--    when a new user signs up / is created in auth.users.
-- 2. Auth User Trigger (on_auth_user_created): Fires handle_new_user() AFTER INSERT on auth.users.
-- 3. Backfill Existing Users: Ensures any existing auth.users without a profile receive a default student profile.
-- 4. Founder Update RLS Policy ("Founders can update profiles"): Grants users with the founder role
--    permission to UPDATE profile rows using public.is_founder().

-- 1. Create or replace trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, language_access, course_level)
  VALUES (NEW.id, 'student', '{}', NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing auth.users without profiles
INSERT INTO public.profiles (id, role, language_access)
SELECT id, 'student', '{}'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. RLS Policy allowing founders to update profiles
DROP POLICY IF EXISTS "Founders can update profiles" ON public.profiles;
CREATE POLICY "Founders can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_founder())
  WITH CHECK (public.is_founder());
