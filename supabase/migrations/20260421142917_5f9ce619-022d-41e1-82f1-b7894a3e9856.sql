CREATE OR REPLACE FUNCTION public.ensure_profile_public_uid()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_uid text;
  generated_uid text;
  uid_exists boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT public_uid INTO current_uid
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF current_uid IS NOT NULL AND length(trim(current_uid)) > 0 THEN
    RETURN current_uid;
  END IF;

  LOOP
    generated_uid := 'MR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE public_uid = generated_uid) INTO uid_exists;
    EXIT WHEN NOT uid_exists;
  END LOOP;

  UPDATE public.profiles
  SET public_uid = generated_uid
  WHERE user_id = auth.uid();

  RETURN generated_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_email_verified(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verified boolean;
BEGIN
  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM auth.users
    WHERE lower(email) = lower(trim(_email))
      AND email_confirmed_at IS NOT NULL
  ) INTO verified;

  RETURN COALESCE(verified, false);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_profile_public_uid() FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_profile_public_uid() TO authenticated;

REVOKE ALL ON FUNCTION public.is_email_verified(text) FROM public;
GRANT EXECUTE ON FUNCTION public.is_email_verified(text) TO anon, authenticated;