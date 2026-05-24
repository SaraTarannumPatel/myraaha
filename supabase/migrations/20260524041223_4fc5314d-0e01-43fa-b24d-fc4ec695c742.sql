
-- Newsletter subscriptions table
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscriptions enable row level security;

create policy "anyone can subscribe"
  on public.newsletter_subscriptions for insert
  to anon, authenticated
  with check (true);

-- Storage bucket for community-submitted insight cover images
insert into storage.buckets (id, name, public)
values ('insight-covers', 'insight-covers', true)
on conflict (id) do nothing;

create policy "Public read insight covers"
  on storage.objects for select
  using (bucket_id = 'insight-covers');

create policy "Anyone can upload insight covers"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'insight-covers');
