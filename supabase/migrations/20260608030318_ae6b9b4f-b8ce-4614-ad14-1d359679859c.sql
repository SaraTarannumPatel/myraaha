
ALTER TABLE public.role_ksao_vectors DROP CONSTRAINT IF EXISTS role_ksao_vectors_role_id_fkey;
ALTER TABLE public.role_ksao_vectors
  ADD CONSTRAINT role_ksao_vectors_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES public.career_taxonomy(role_uuid) ON DELETE CASCADE;
