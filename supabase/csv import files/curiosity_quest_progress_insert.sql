-- Idempotent upsert for curiosity_quest_progress
-- Conflict on UNIQUE(user_id, quest_id)
-- NOTE: user_id must exist in auth.users and quest_id must exist in curiosity_quests

-- Step 1: Ensure the user exists in auth.users (placeholder seed)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '99d92034-4e39-446f-b552-6d14de2896d6',
  'seed-user@myraaha.com',
  '',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Ensure the quest exists in curiosity_quests (the referenced quest_id)
INSERT INTO public.curiosity_quests (id, title, description, quest_type, category, prompts, points, badge_reward)
VALUES (
  'a8249357-1b66-4bb9-9d98-73628c7c9795',
  'Discover Your Spark',
  'Find what naturally energizes you',
  'story',
  'self-discovery',
  '[{"question": "What activities make you lose track of time?", "type": "open"}, {"question": "When do you feel most alive?", "type": "open"}, {"question": "What would you do even without getting paid?", "type": "open"}]',
  20,
  'spark_finder'
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Upsert the progress row
INSERT INTO public.curiosity_quest_progress (
  id,
  user_id,
  quest_id,
  status,
  responses,
  points_earned,
  mood_checkpoint,
  started_at,
  completed_at,
  analysis_results
)
VALUES (
  '707e2f6a-6d7b-4779-b4b4-6ff2e7623f09',
  '99d92034-4e39-446f-b552-6d14de2896d6',
  'a8249357-1b66-4bb9-9d98-73628c7c9795',
  'completed',
  '{"0": "Singing, Songwriting, UI/UX Design, Vibe Coding, Recording music albums, performing songs, reading, writing literature, designing clothes, manufacturing cars, starting tech companies, intraday trading, learning about blockchain and quant trading", "1": "Singing & Songwriting, trading the stock markets, designing apps & software, designing cars, designing clothes", "2": "Sing & write songs, design awesome apps & software, build digital automations, working in garage experimenting with cars, exploring medieval clothing styles."}',
  20,
  'curious',
  '2026-03-09 15:00:11.932416+00',
  '2026-03-09 15:07:36.771+00',
  NULL
)
ON CONFLICT (user_id, quest_id) DO UPDATE SET
  status        = EXCLUDED.status,
  responses     = EXCLUDED.responses,
  points_earned = EXCLUDED.points_earned,
  mood_checkpoint = EXCLUDED.mood_checkpoint,
  started_at    = EXCLUDED.started_at,
  completed_at  = EXCLUDED.completed_at,
  analysis_results = EXCLUDED.analysis_results;
