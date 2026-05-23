
-- Startup literacy capsules
CREATE TABLE public.learning_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'basics',
  difficulty TEXT DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}'::text[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Startup playbooks
CREATE TABLE public.startup_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'ideation',
  steps JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  case_study TEXT,
  difficulty TEXT DEFAULT 'beginner',
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Founder simulation challenges
CREATE TABLE public.simulation_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  constraints JSONB DEFAULT '{}'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  learning_outcome TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  category TEXT DEFAULT 'decision_making',
  points INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User learning progress (capsules, playbooks, simulations)
CREATE TABLE public.user_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  status TEXT DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.learning_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Capsules publicly viewable" ON public.learning_capsules FOR SELECT USING (true);
CREATE POLICY "Playbooks publicly viewable" ON public.startup_playbooks FOR SELECT USING (true);
CREATE POLICY "Simulations publicly viewable" ON public.simulation_challenges FOR SELECT USING (true);
CREATE POLICY "Users can CRUD own learning progress" ON public.user_learning_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_learning_progress;

-- Seed capsules
INSERT INTO public.learning_capsules (title, description, content, category, difficulty, duration_minutes, order_index) VALUES
('What is Market Research?', 'Understand how to validate demand before building.', 'Market research is the process of gathering information about your target customers and competitors. Start by defining your target audience, then use surveys, interviews, and online tools to understand their needs, pain points, and willingness to pay. Key methods include: 1) Customer interviews - talk to 10+ potential users, 2) Competitor analysis - study existing solutions, 3) Market sizing - estimate your total addressable market (TAM), 4) Trend analysis - identify growing or declining markets.', 'market_research', 'beginner', 5, 1),
('Customer Empathy 101', 'Learn to see through your customer''s eyes.', 'Customer empathy means deeply understanding the emotions, frustrations, and motivations of the people you want to serve. Build empathy by: 1) Conducting empathy interviews - ask open-ended questions about their daily challenges, 2) Creating empathy maps - document what customers Say, Think, Do, and Feel, 3) Journey mapping - trace the full experience a customer has with a problem, 4) Shadowing - observe customers in their natural environment. Remember: your assumptions are often wrong. Let customer insights drive your decisions.', 'customer_empathy', 'beginner', 5, 2),
('MVP Thinking', 'Build the smallest thing that delivers value.', 'An MVP (Minimum Viable Product) is the simplest version of your idea that lets you test your core hypothesis. Rules of MVP thinking: 1) Identify your riskiest assumption - what must be true for your idea to work? 2) Build only what tests that assumption, 3) Measure: define success metrics before launching, 4) Learn: use data to decide whether to pivot, persevere, or kill the idea. Types of MVPs: landing page test, concierge MVP (manual delivery), Wizard of Oz (human-powered backend), prototype demo. The goal is learning, not perfection.', 'mvp', 'beginner', 7, 3),
('Legal Structures for Startups', 'Choose the right legal foundation.', 'Your legal structure affects taxes, liability, and fundraising. Common options: 1) Sole Proprietorship - simplest, but unlimited personal liability, 2) Partnership - shared ownership with shared liability, 3) LLP - limited liability for partners, 4) Private Limited Company - separate legal entity, ideal for fundraising, 5) One Person Company - single-owner company with limited liability. Consider: how many founders? Do you plan to raise investment? What''s your risk tolerance? Consult a legal advisor early to avoid costly restructuring later.', 'legal', 'intermediate', 8, 4),
('Unit Economics Basics', 'Know your numbers before scaling.', 'Unit economics measure the revenue and costs associated with a single unit of your business (one customer, one transaction). Key metrics: 1) CAC (Customer Acquisition Cost) - how much you spend to get one customer, 2) LTV (Lifetime Value) - total revenue from one customer over their lifetime, 3) LTV:CAC ratio - aim for 3:1 or higher, 4) Payback period - how long until you recover CAC, 5) Gross margin - revenue minus direct costs. If your unit economics don''t work, scaling will only amplify losses. Fix the fundamentals first.', 'finance', 'intermediate', 6, 5),
('The Art of Pitching', 'Communicate your vision in 60 seconds.', 'A great pitch tells a compelling story in minimal time. Structure: 1) Problem - what painful problem exists? 2) Solution - how do you solve it uniquely? 3) Market - how big is the opportunity? 4) Traction - what proof do you have? 5) Team - why are you the right people? 6) Ask - what do you need? Tips: lead with emotion, use specific numbers, practice until it feels natural. Common mistakes: too much jargon, no clear ask, focusing on features instead of outcomes. Practice your pitch daily until it''s second nature.', 'pitching', 'beginner', 5, 6);

-- Seed playbooks
INSERT INTO public.startup_playbooks (title, description, phase, steps, checklist, case_study, difficulty) VALUES
('Idea Validation Playbook', 'A step-by-step guide to validating your startup idea before building anything.', 'ideation', '[{"title":"Define Your Hypothesis","content":"Write a clear problem-solution hypothesis: I believe [target customer] has [problem] and would pay for [solution]."},{"title":"Customer Discovery","content":"Interview 15-20 potential customers. Ask about their problems, not your solution."},{"title":"Competitor Analysis","content":"Map existing solutions. Identify gaps and differentiation opportunities."},{"title":"Landing Page Test","content":"Create a simple page describing your solution. Measure sign-up interest."},{"title":"Decision Point","content":"Based on data: pivot, persevere, or kill the idea."}]', '[{"item":"Problem hypothesis written","done":false},{"item":"15+ customer interviews completed","done":false},{"item":"Competitor map created","done":false},{"item":"Landing page live with analytics","done":false},{"item":"Go/no-go decision documented","done":false}]', 'Dropbox validated their idea with a simple explainer video before writing a single line of code. The video generated 70,000 sign-ups overnight, proving massive demand.', 'beginner'),
('Branding & Positioning Playbook', 'Build a brand that resonates with your target audience.', 'branding', '[{"title":"Define Your Brand Values","content":"List 3-5 core values that drive your venture. These guide every decision."},{"title":"Craft Your Positioning Statement","content":"For [target], [product] is the [category] that [key benefit] because [reason to believe]."},{"title":"Visual Identity","content":"Choose colors, typography, and imagery that reflect your brand personality."},{"title":"Brand Voice","content":"Define how your brand communicates: formal vs casual, serious vs playful."},{"title":"Consistency Check","content":"Audit all touchpoints to ensure brand consistency across channels."}]', '[{"item":"Brand values defined","done":false},{"item":"Positioning statement written","done":false},{"item":"Logo and colors chosen","done":false},{"item":"Brand voice guide created","done":false},{"item":"All channels audited","done":false}]', 'Airbnb rebranded from a budget travel option to a community-driven belonging platform. Their "Belong Anywhere" positioning transformed them from a niche player to a global brand.', 'intermediate'),
('Fundraising Readiness Playbook', 'Prepare your startup for investment conversations.', 'fundraising', '[{"title":"Know Your Numbers","content":"Master your unit economics, burn rate, runway, and growth metrics."},{"title":"Build Your Pitch Deck","content":"Create a 10-12 slide deck covering problem, solution, market, traction, team, and ask."},{"title":"Identify Target Investors","content":"Research investors who fund your stage, sector, and geography."},{"title":"Practice Your Pitch","content":"Rehearse with mentors and peers. Get brutally honest feedback."},{"title":"Due Diligence Prep","content":"Organize legal documents, cap table, financial projections, and customer data."}]', '[{"item":"Financial model complete","done":false},{"item":"Pitch deck ready","done":false},{"item":"Target investor list of 30+","done":false},{"item":"10+ pitch practice sessions done","done":false},{"item":"Data room organized","done":false}]', 'Notion raised their Series A after demonstrating strong product-led growth. They focused on user love metrics rather than just revenue, which resonated with investors.', 'advanced');

-- Seed simulation challenges
INSERT INTO public.simulation_challenges (title, scenario, constraints, options, learning_outcome, difficulty, category, points) VALUES
('The Pivot Decision', 'Your app has 500 users but only 2% are active after 30 days. You have 4 months of runway left. Your co-founder wants to add more features. Your advisor suggests pivoting to a different customer segment.', '{"runway_months":4,"active_users":10,"total_users":500,"budget":"limited"}', '[{"label":"Add more features to increase engagement","outcome":"Features take 2 months. Engagement improves slightly but burns runway faster.","score":30},{"label":"Pivot to the new customer segment","outcome":"Pivot requires customer discovery. Risky but addresses root cause.","score":70},{"label":"Double down on marketing to get more users","outcome":"More users but same retention problem. Masks the real issue.","score":20},{"label":"Talk to churned users first","outcome":"Smart move. Understanding why users leave reveals whether to pivot or iterate.","score":90}]', 'The best founders gather data before making big decisions. Talking to churned users reveals root causes before committing resources.', 'intermediate', 'decision_making', 25),
('Budget Crunch', 'You have ₹5 lakhs remaining. Your developer costs ₹80K/month. Marketing is ₹30K/month. You need 3 more months to reach product-market fit. How do you allocate?', '{"budget":500000,"dev_cost":80000,"marketing_cost":30000,"months_needed":3}', '[{"label":"Cut marketing entirely, focus on product","outcome":"Product improves but no new users to validate with. Dangerous isolation.","score":40},{"label":"Find a technical co-founder, cut dev costs","outcome":"Reduces burn significantly. Aligns incentives. Smart long-term move.","score":80},{"label":"Take on freelance work to extend runway","outcome":"Extends runway but splits focus. Can work if managed carefully.","score":50},{"label":"Raise a small friends & family round","outcome":"Quick capital but dilutes equity early. Viable if terms are fair.","score":60}]', 'Resource constraints force creative solutions. Finding a co-founder or reducing costs structurally is more sustainable than band-aid fixes.', 'intermediate', 'resource_management', 20),
('Customer vs. Investor', 'Your biggest customer wants a custom feature that would take 6 weeks. An investor is interested but wants to see you focus on scalable features. You can only do one.', '{"customer_revenue":"40% of income","investor_interest":"Series A potential","dev_capacity":"limited"}', '[{"label":"Build the custom feature for the customer","outcome":"Keeps revenue but makes product less scalable. May lose investor interest.","score":35},{"label":"Focus on scalable features for the investor","outcome":"May lose the customer but positions for growth. Risky short-term.","score":55},{"label":"Negotiate with both - partial custom + scalable roadmap","outcome":"Shows maturity and communication skills. Best if executed well.","score":85},{"label":"Hire a contractor for the custom feature","outcome":"Costs money but preserves both relationships. Good if budget allows.","score":70}]', 'The best entrepreneurs find creative solutions that serve multiple stakeholders. Negotiation and communication are underrated founder skills.', 'advanced', 'stakeholder_management', 30);
