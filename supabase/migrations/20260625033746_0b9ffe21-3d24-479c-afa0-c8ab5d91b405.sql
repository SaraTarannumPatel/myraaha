
REVOKE ALL ON FUNCTION public.log_security_event(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb) TO authenticated, service_role;
