CREATE OR REPLACE FUNCTION public.generate_public_uid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_uid text;
  uid_exists boolean;
BEGIN
  IF NEW.public_uid IS NOT NULL AND length(trim(NEW.public_uid)) > 0 THEN
    RETURN NEW;
  END IF;

  LOOP
    new_uid := 'MR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    SELECT EXISTS(
      SELECT 1
      FROM public.profiles
      WHERE public_uid = new_uid
    ) INTO uid_exists;
    EXIT WHEN NOT uid_exists;
  END LOOP;

  NEW.public_uid := new_uid;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_public_uid ON public.profiles;
CREATE TRIGGER set_profiles_public_uid
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_public_uid();

DO $$
DECLARE
  profile_record record;
  generated_uid text;
  uid_exists boolean;
BEGIN
  FOR profile_record IN
    SELECT id FROM public.profiles WHERE public_uid IS NULL OR length(trim(public_uid)) = 0
  LOOP
    LOOP
      generated_uid := 'MR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE public_uid = generated_uid) INTO uid_exists;
      EXIT WHEN NOT uid_exists;
    END LOOP;

    UPDATE public.profiles
    SET public_uid = generated_uid
    WHERE id = profile_record.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_public_uid_unique_idx
ON public.profiles (public_uid)
WHERE public_uid IS NOT NULL;