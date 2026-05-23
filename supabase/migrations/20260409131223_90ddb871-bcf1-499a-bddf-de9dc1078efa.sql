
CREATE TABLE public.onboarding_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_percent INTEGER NOT NULL,
  reward_key TEXT NOT NULL,
  reward_title TEXT NOT NULL,
  reward_description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, reward_key)
);

ALTER TABLE public.onboarding_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
ON public.onboarding_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rewards"
ON public.onboarding_rewards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_onboarding_rewards_user ON public.onboarding_rewards(user_id);
