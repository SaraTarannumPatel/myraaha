REVOKE EXECUTE ON FUNCTION public.get_sector_trending(int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_sector_trending(int) TO authenticated;