-- Sync auth.users -> public.profiles (issue #69 schema).
-- Apply via: psql "$DIRECT_URL" -f prisma/sql/001_profiles_trigger.sql
-- Or paste into the Supabase SQL Editor.
--
-- Profile.id is a cuid-shaped TEXT generated deterministically from the
-- auth UUID ('c' + first 24 hex chars). Determinism keeps the seed and the
-- trigger producing the same id for the same auth user no matter how many
-- times the script is replayed, which makes ON CONFLICT (auth_user_id)
-- safe to re-run.

INSERT INTO public.profiles (id, auth_user_id, name, handle, avatar_url, created_at, updated_at)
SELECT 'c' || substring(replace(id::text, '-', ''), 1, 24),
       id,
       raw_user_meta_data->>'name',
       'user_' || substring(replace(id::text, '-', ''), 1, 12),
       raw_user_meta_data->>'avatar_url',
       now(),
       now()
FROM auth.users
ON CONFLICT (auth_user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- handle is NOT NULL; seed a deterministic placeholder so the trigger
  -- never violates the constraint. Users can rename it via /me/edit.
  INSERT INTO public.profiles (id, auth_user_id, name, handle, avatar_url, created_at, updated_at)
  VALUES (
    'c' || substring(replace(NEW.id::text, '-', ''), 1, 24),
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    'user_' || substring(replace(NEW.id::text, '-', ''), 1, 12),
    NEW.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  ON CONFLICT (auth_user_id) DO UPDATE
    -- Keep display-name / avatar in sync when Supabase metadata changes.
    -- Do NOT touch handle here: a user may have renamed it via /me/edit
    -- and the OAuth payload would otherwise overwrite their choice.
    SET name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS without policies: the Supabase publishable key / authenticated
-- roles are unable to read or write profiles. All access goes through Prisma
-- (postgres role, which bypasses RLS). Defense in depth against accidental
-- exposure of the table via the Supabase REST API.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
