DROP INDEX IF EXISTS public.content_library_items_source_url_key;
ALTER TABLE public.content_library_items
  ADD CONSTRAINT content_library_items_source_url_key UNIQUE (source_url);