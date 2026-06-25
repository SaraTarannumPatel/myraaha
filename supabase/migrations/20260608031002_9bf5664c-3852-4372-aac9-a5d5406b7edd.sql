CREATE OR REPLACE FUNCTION public.get_career_map_stats()
RETURNS TABLE(total_roles bigint, plotted_roles bigint, cluster_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint AS total_roles,
    COUNT(coord_x)::bigint AS plotted_roles,
    COUNT(DISTINCT cluster_id)::bigint AS cluster_count
  FROM public.career_taxonomy;
$$;

GRANT EXECUTE ON FUNCTION public.get_career_map_stats() TO anon, authenticated, service_role;