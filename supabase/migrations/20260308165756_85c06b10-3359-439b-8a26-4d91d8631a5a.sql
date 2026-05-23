
CREATE TABLE public.opportunity_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
  company_challenge_id UUID REFERENCES public.company_challenges(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'deadline',
  reminder_date TIMESTAMPTZ NOT NULL,
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.opportunity_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
  ON public.opportunity_reminders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
