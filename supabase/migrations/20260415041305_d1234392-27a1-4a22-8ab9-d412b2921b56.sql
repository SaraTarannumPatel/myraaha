
-- Add public_uid column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_uid TEXT UNIQUE;

-- Function to generate a unique public UID like "MR-A1B2C3"
CREATE OR REPLACE FUNCTION public.generate_public_uid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_uid TEXT;
  uid_exists BOOLEAN;
BEGIN
  LOOP
    new_uid := 'MR-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE public_uid = new_uid) INTO uid_exists;
    EXIT WHEN NOT uid_exists;
  END LOOP;
  NEW.public_uid := new_uid;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate public_uid on insert
CREATE TRIGGER set_public_uid
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.public_uid IS NULL)
EXECUTE FUNCTION public.generate_public_uid();

-- Backfill existing profiles that don't have a public_uid
UPDATE public.profiles
SET public_uid = 'MR-' || upper(substr(md5(gen_random_uuid()::text), 1, 6))
WHERE public_uid IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_public_uid ON public.profiles(public_uid);
