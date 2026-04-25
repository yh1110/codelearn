-- Sync auth.users -> public.profiles
-- Apply via: psql "$DIRECT_URL" -f prisma/sql/001_profiles_trigger.sql
-- Or paste into the Supabase SQL Editor.

INSERT INTO public.profiles (id, email, name, username, avatar_url, created_at, updated_at)
SELECT id,
       email,
       raw_user_meta_data->>'name',
       'user_' || substring(replace(id::text, '-', ''), 1, 12),
       raw_user_meta_data->>'avatar_url',
       now(),
       now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- username is NOT NULL; seed a deterministic placeholder so the trigger
  -- never violates the constraint. Users can rename it via /me/edit.
  INSERT INTO public.profiles (id, email, name, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    'user_' || substring(replace(NEW.id::text, '-', ''), 1, 12),
    NEW.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
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
