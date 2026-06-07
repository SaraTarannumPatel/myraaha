DROP POLICY IF EXISTS "user_ksao own" ON public.user_ksao_vectors;
REVOKE INSERT, UPDATE, DELETE ON public.user_ksao_vectors FROM authenticated;
GRANT SELECT ON public.user_ksao_vectors TO authenticated;
GRANT ALL ON public.user_ksao_vectors TO service_role;
CREATE POLICY "Users can view own ksao vectors" ON public.user_ksao_vectors FOR SELECT TO authenticated USING (auth.uid() = user_id);