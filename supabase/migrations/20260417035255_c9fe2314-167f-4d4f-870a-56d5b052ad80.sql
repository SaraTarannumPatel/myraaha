-- Add missing relation columns
ALTER TABLE public.sector_directory
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_domains text[];

ALTER TABLE public.subjects_directory
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_industries text[];

ALTER TABLE public.skills_directory
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_domains text[];

-- Add unique constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'industry_directory_name_unique') THEN
    ALTER TABLE public.industry_directory ADD CONSTRAINT industry_directory_name_unique UNIQUE (name);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sector_directory_name_unique') THEN
    ALTER TABLE public.sector_directory ADD CONSTRAINT sector_directory_name_unique UNIQUE (name);
  END IF;
END $$;

-- Seed industries (idempotent via ON CONFLICT)
INSERT INTO public.industry_directory (name, description, icon_emoji, demand_level, growth_trajectory, avg_salary_usd, keywords, soft_skills, interests) VALUES
  ('Banking & Financial Services', 'Retail, commercial, and investment banking', '🏦', 'High', 'Stable', '$75,000', ARRAY['banking','finance','loans'], ARRAY['analytical'], ARRAY['finance']),
  ('Fintech', 'Technology-driven financial services', '💳', 'Very High', 'Rapid Growth', '$110,000', ARRAY['fintech','payments','crypto'], ARRAY['innovation'], ARRAY['technology','finance']),
  ('Insurance', 'Risk management and insurance', '🛡️', 'High', 'Stable', '$70,000', ARRAY['insurance','underwriting','risk'], ARRAY['analytical'], ARRAY['finance']),
  ('Pharmaceuticals', 'Drug discovery and manufacturing', '💊', 'Very High', 'Strong Growth', '$95,000', ARRAY['pharma','drugs','medicine'], ARRAY['research'], ARRAY['biology','medicine']),
  ('Biotechnology', 'Genetic engineering and bio-research', '🧬', 'Very High', 'Rapid Growth', '$105,000', ARRAY['biotech','genetics','bioengineering'], ARRAY['research'], ARRAY['biology','science']),
  ('Healthcare Services', 'Hospitals and patient care', '🏥', 'Very High', 'Strong Growth', '$80,000', ARRAY['healthcare','hospital','nursing'], ARRAY['empathy'], ARRAY['medicine','health']),
  ('EdTech', 'Education technology', '📚', 'High', 'Strong Growth', '$85,000', ARRAY['edtech','elearning','education'], ARRAY['empathy','creativity'], ARRAY['education','technology']),
  ('Software Development', 'Building software products', '💻', 'Very High', 'Rapid Growth', '$115,000', ARRAY['software','programming','coding'], ARRAY['problem-solving'], ARRAY['technology','coding']),
  ('Cloud Computing', 'Cloud and SaaS', '☁️', 'Very High', 'Rapid Growth', '$130,000', ARRAY['cloud','aws','azure','saas'], ARRAY['systems thinking'], ARRAY['technology']),
  ('Cybersecurity', 'Information security', '🔒', 'Very High', 'Rapid Growth', '$120,000', ARRAY['cybersecurity','security','infosec'], ARRAY['vigilance'], ARRAY['technology','security']),
  ('Artificial Intelligence', 'AI/ML research and applications', '🤖', 'Very High', 'Rapid Growth', '$140,000', ARRAY['ai','machine learning','llm','nlp'], ARRAY['research'], ARRAY['technology','math']),
  ('Data Science & Analytics', 'Data insights and BI', '📈', 'Very High', 'Rapid Growth', '$110,000', ARRAY['data','analytics','statistics'], ARRAY['analytical'], ARRAY['math','technology']),
  ('Gaming & Esports', 'Video games and competitive gaming', '🎮', 'High', 'Strong Growth', '$90,000', ARRAY['gaming','esports','unity','unreal'], ARRAY['creativity'], ARRAY['gaming','design']),
  ('Film & Television', 'Movie and TV production', '🎬', 'High', 'Steady', '$75,000', ARRAY['film','tv','production','cinema'], ARRAY['creativity'], ARRAY['film','arts']),
  ('Music Industry', 'Music production and performance', '🎵', 'Medium', 'Steady', '$65,000', ARRAY['music','production','recording'], ARRAY['creativity'], ARRAY['music','arts']),
  ('Advertising & Marketing', 'Brand strategy and campaigns', '📣', 'High', 'Steady', '$80,000', ARRAY['advertising','marketing','brand'], ARRAY['creativity'], ARRAY['marketing']),
  ('Aerospace & Defense', 'Aircraft and defense systems', '🚀', 'High', 'Strong Growth', '$110,000', ARRAY['aerospace','defense','aviation','space'], ARRAY['precision'], ARRAY['engineering','aviation']),
  ('Space Technology', 'Commercial space and satellites', '🛰️', 'High', 'Rapid Growth', '$120,000', ARRAY['space','satellites','rockets'], ARRAY['innovation'], ARRAY['space','science']),
  ('Automotive', 'Vehicle design and EVs', '🚗', 'High', 'Transforming', '$85,000', ARRAY['automotive','cars','EV','autonomous'], ARRAY['engineering'], ARRAY['cars']),
  ('Renewable Energy', 'Solar, wind, clean energy', '☀️', 'Very High', 'Rapid Growth', '$95,000', ARRAY['renewable','solar','wind','sustainability'], ARRAY['systems thinking'], ARRAY['environment']),
  ('Agriculture & Agritech', 'Crops, livestock, farm tech', '🌾', 'High', 'Strong Growth', '$60,000', ARRAY['agriculture','farming','agritech'], ARRAY['patience'], ARRAY['nature','food']),
  ('Retail & E-commerce', 'Physical and online retail', '🛍️', 'High', 'Strong Growth', '$70,000', ARRAY['retail','ecommerce','consumer'], ARRAY['service'], ARRAY['business']),
  ('Logistics & Supply Chain', 'Transport and warehousing', '📦', 'Very High', 'Strong Growth', '$80,000', ARRAY['logistics','supply chain','shipping'], ARRAY['operations'], ARRAY['business']),
  ('Real Estate', 'Property development and sales', '🏘️', 'High', 'Cyclical', '$85,000', ARRAY['real estate','property','development'], ARRAY['negotiation'], ARRAY['property']),
  ('Construction', 'Building and infrastructure', '🏗️', 'High', 'Steady', '$75,000', ARRAY['construction','building','infrastructure'], ARRAY['planning'], ARRAY['engineering']),
  ('Architecture', 'Building design', '📐', 'High', 'Steady', '$80,000', ARRAY['architecture','design','urban planning'], ARRAY['creativity'], ARRAY['design','art']),
  ('Hospitality & Tourism', 'Hotels and tourism', '🏨', 'High', 'Recovering', '$55,000', ARRAY['hospitality','hotels','tourism'], ARRAY['service'], ARRAY['travel']),
  ('Sports & Fitness', 'Sports and wellness', '⚽', 'High', 'Strong Growth', '$70,000', ARRAY['sports','fitness','wellness'], ARRAY['discipline'], ARRAY['sports','health']),
  ('Fashion & Apparel', 'Clothing design and retail', '👗', 'High', 'Steady', '$65,000', ARRAY['fashion','apparel','design'], ARRAY['creativity'], ARRAY['fashion']),
  ('Telecommunications', 'Mobile and internet', '📡', 'High', 'Steady', '$90,000', ARRAY['telecom','5G','networks','mobile'], ARRAY['systems thinking'], ARRAY['technology']),
  ('Legal Services', 'Law and compliance', '⚖️', 'High', 'Stable', '$110,000', ARRAY['law','legal','compliance'], ARRAY['analytical'], ARRAY['law']),
  ('Consulting', 'Strategy and management consulting', '💼', 'Very High', 'Strong Growth', '$120,000', ARRAY['consulting','strategy','management'], ARRAY['analytical'], ARRAY['business']),
  ('Climate Tech', 'Carbon and climate solutions', '🌍', 'Very High', 'Rapid Growth', '$110,000', ARRAY['climate','carbon','sustainability','esg'], ARRAY['innovation'], ARRAY['environment']),
  ('Robotics & Automation', 'Industrial and consumer robotics', '🦾', 'High', 'Strong Growth', '$110,000', ARRAY['robotics','automation','manufacturing'], ARRAY['engineering'], ARRAY['robots']),
  ('AR/VR & Metaverse', 'Immersive technology', '🥽', 'High', 'Strong Growth', '$110,000', ARRAY['ar','vr','xr','metaverse'], ARRAY['creativity'], ARRAY['gaming','tech']),
  ('Mental Health & Wellness', 'Therapy and counseling', '🧠', 'Very High', 'Rapid Growth', '$70,000', ARRAY['mental health','therapy','wellness'], ARRAY['empathy'], ARRAY['psychology']),
  ('Creator Economy', 'Influencer and creator tools', '🎨', 'High', 'Rapid Growth', '$60,000', ARRAY['creator','influencer','content'], ARRAY['creativity'], ARRAY['content']),
  ('Web3 & Crypto', 'Blockchain and DeFi', '🪙', 'Medium', 'Volatile', '$120,000', ARRAY['web3','crypto','blockchain','defi'], ARRAY['innovation'], ARRAY['crypto']),
  ('Government & Public Sector', 'Public administration', '🏛️', 'High', 'Stable', '$70,000', ARRAY['government','public sector','policy'], ARRAY['service'], ARRAY['policy']),
  ('Non-Profit & NGOs', 'Social impact organizations', '🤝', 'Medium', 'Steady', '$55,000', ARRAY['nonprofit','ngo','social impact'], ARRAY['empathy'], ARRAY['social good'])
ON CONFLICT (name) DO NOTHING;

-- Seed sectors
INSERT INTO public.sector_directory (name, description, icon_emoji, demand_level, growth_trajectory, avg_salary_usd, keywords, soft_skills, interests) VALUES
  ('Information Technology', 'IT services and software', '💻', 'Very High', 'Rapid Growth', '$100,000', ARRAY['IT','tech','software'], ARRAY['problem-solving'], ARRAY['technology']),
  ('Financial Services', 'Banking and investment', '💰', 'Very High', 'Strong', '$95,000', ARRAY['finance','banking','investment'], ARRAY['analytical'], ARRAY['finance']),
  ('Healthcare & Life Sciences', 'Medical and pharma', '⚕️', 'Very High', 'Strong Growth', '$90,000', ARRAY['healthcare','medical'], ARRAY['empathy'], ARRAY['health']),
  ('Manufacturing', 'Industrial production', '🏭', 'High', 'Steady', '$70,000', ARRAY['manufacturing','industrial'], ARRAY['precision'], ARRAY['making']),
  ('Energy & Utilities', 'Power and utilities', '⚡', 'High', 'Transforming', '$95,000', ARRAY['energy','utilities','power'], ARRAY['safety'], ARRAY['energy']),
  ('Education', 'Schools and training', '🎓', 'High', 'Stable', '$60,000', ARRAY['education','teaching'], ARRAY['communication'], ARRAY['teaching']),
  ('Government & Defense', 'Public sector and defense', '🏛️', 'High', 'Stable', '$80,000', ARRAY['government','defense'], ARRAY['service'], ARRAY['policy']),
  ('Media & Entertainment', 'Film, TV, music, gaming', '🎬', 'High', 'Strong Growth', '$80,000', ARRAY['media','entertainment','content'], ARRAY['creativity'], ARRAY['media']),
  ('Retail & Consumer Goods', 'Retail and FMCG', '🛒', 'High', 'Steady', '$65,000', ARRAY['retail','consumer'], ARRAY['service'], ARRAY['shopping']),
  ('Transportation & Logistics', 'Freight and mobility', '🚛', 'High', 'Strong Growth', '$75,000', ARRAY['transport','logistics'], ARRAY['planning'], ARRAY['operations']),
  ('Real Estate & Construction', 'Property and construction', '🏗️', 'High', 'Cyclical', '$80,000', ARRAY['real estate','construction'], ARRAY['negotiation'], ARRAY['property']),
  ('Hospitality & Tourism', 'Hotels and travel', '🏨', 'High', 'Recovering', '$55,000', ARRAY['hospitality','tourism','travel'], ARRAY['service'], ARRAY['travel']),
  ('Agriculture & Food', 'Farming and agribusiness', '🌾', 'High', 'Strong Growth', '$60,000', ARRAY['agriculture','food','farming'], ARRAY['patience'], ARRAY['food']),
  ('Telecommunications', 'Telecom and internet', '📡', 'High', 'Steady', '$90,000', ARRAY['telecom','mobile'], ARRAY['systems thinking'], ARRAY['networks']),
  ('Professional Services', 'Consulting, legal, accounting', '💼', 'Very High', 'Strong', '$110,000', ARRAY['consulting','professional'], ARRAY['analytical'], ARRAY['business']),
  ('Non-Profit', 'NGOs and social impact', '🤝', 'Medium', 'Steady', '$55,000', ARRAY['nonprofit','social impact'], ARRAY['empathy'], ARRAY['social good']),
  ('Arts & Creative', 'Design and arts', '🎨', 'Medium', 'Steady', '$60,000', ARRAY['arts','creative','design'], ARRAY['creativity'], ARRAY['arts']),
  ('Sports & Recreation', 'Sports and fitness', '⚽', 'High', 'Strong Growth', '$70,000', ARRAY['sports','fitness'], ARRAY['discipline'], ARRAY['sports']),
  ('Environmental Services', 'Sustainability and climate', '🌱', 'High', 'Rapid Growth', '$80,000', ARRAY['environment','sustainability'], ARRAY['systems thinking'], ARRAY['environment']),
  ('Aerospace', 'Aviation and space', '✈️', 'High', 'Strong Growth', '$110,000', ARRAY['aerospace','aviation','space'], ARRAY['precision'], ARRAY['aviation']),
  ('Automotive', 'Vehicle manufacturing', '🚗', 'High', 'Transforming', '$85,000', ARRAY['automotive','vehicles'], ARRAY['engineering'], ARRAY['cars']),
  ('Pharmaceuticals', 'Drug manufacturing', '💊', 'Very High', 'Strong Growth', '$95,000', ARRAY['pharma','drugs'], ARRAY['research'], ARRAY['medicine']),
  ('Biotech', 'Bioengineering', '🧬', 'Very High', 'Rapid Growth', '$105,000', ARRAY['biotech','genetics'], ARRAY['research'], ARRAY['biology']),
  ('Insurance', 'Insurance products', '🛡️', 'High', 'Stable', '$70,000', ARRAY['insurance','claims'], ARRAY['analytical'], ARRAY['risk']),
  ('Public Health', 'Public health systems', '🏥', 'Very High', 'Strong Growth', '$75,000', ARRAY['public health','epidemiology'], ARRAY['empathy'], ARRAY['health']),
  ('Mental Health Services', 'Therapy and counseling', '🧠', 'Very High', 'Rapid Growth', '$70,000', ARRAY['mental health','therapy'], ARRAY['empathy'], ARRAY['psychology']),
  ('Beauty & Personal Care', 'Beauty products', '💄', 'High', 'Strong Growth', '$60,000', ARRAY['beauty','cosmetics'], ARRAY['creativity'], ARRAY['beauty']),
  ('Fashion & Textiles', 'Clothing and textiles', '👗', 'High', 'Steady', '$65,000', ARRAY['fashion','textiles'], ARRAY['creativity'], ARRAY['fashion']),
  ('Wellness & Fitness', 'Gyms and yoga', '🧘', 'High', 'Strong Growth', '$55,000', ARRAY['wellness','fitness','yoga'], ARRAY['discipline'], ARRAY['health']),
  ('Mining & Resources', 'Mining and minerals', '⛏️', 'Medium', 'Stable', '$85,000', ARRAY['mining','resources'], ARRAY['safety'], ARRAY['geology']),
  ('Marine & Maritime', 'Marine and shipping', '🚢', 'Medium', 'Stable', '$75,000', ARRAY['marine','maritime','ocean'], ARRAY['safety'], ARRAY['ocean']),
  ('Waste Management', 'Recycling', '♻️', 'High', 'Strong Growth', '$65,000', ARRAY['waste','recycling'], ARRAY['systems thinking'], ARRAY['environment']),
  ('Water & Sanitation', 'Water treatment', '💧', 'High', 'Strong Growth', '$75,000', ARRAY['water','sanitation'], ARRAY['public health'], ARRAY['environment']),
  ('Security Services', 'Physical and digital security', '🔐', 'High', 'Strong Growth', '$70,000', ARRAY['security','protection'], ARRAY['vigilance'], ARRAY['security']),
  ('Legal Services', 'Law firms', '⚖️', 'High', 'Stable', '$110,000', ARRAY['legal','law'], ARRAY['analytical'], ARRAY['law']),
  ('Accounting & Tax', 'Accounting services', '🧮', 'High', 'Stable', '$75,000', ARRAY['accounting','tax','audit'], ARRAY['precision'], ARRAY['finance']),
  ('Architecture & Design', 'Architecture and interiors', '📐', 'High', 'Steady', '$80,000', ARRAY['architecture','design'], ARRAY['creativity'], ARRAY['design']),
  ('Advertising', 'Advertising agencies', '📣', 'High', 'Steady', '$80,000', ARRAY['advertising','ads'], ARRAY['creativity'], ARRAY['marketing']),
  ('Market Research', 'Consumer research', '📊', 'High', 'Steady', '$75,000', ARRAY['research','insights'], ARRAY['analytical'], ARRAY['research']),
  ('Event Management', 'Event planning', '🎉', 'Medium', 'Recovering', '$55,000', ARRAY['events','planning'], ARRAY['organization'], ARRAY['events']),
  ('Translation Services', 'Language services', '🗣️', 'Medium', 'Steady', '$60,000', ARRAY['translation','language'], ARRAY['languages'], ARRAY['languages']),
  ('Veterinary & Animal Care', 'Veterinary services', '🐾', 'High', 'Steady', '$85,000', ARRAY['veterinary','animals'], ARRAY['empathy'], ARRAY['animals']),
  ('Childcare & Early Education', 'Daycare', '👶', 'High', 'Steady', '$45,000', ARRAY['childcare','early childhood'], ARRAY['patience'], ARRAY['children']),
  ('Furniture & Home Goods', 'Home decor', '🛋️', 'Medium', 'Steady', '$55,000', ARRAY['furniture','home','decor'], ARRAY['design'], ARRAY['home']),
  ('Forestry & Timber', 'Forest and timber', '🌲', 'Medium', 'Stable', '$60,000', ARRAY['forestry','timber'], ARRAY['outdoors'], ARRAY['nature']),
  ('Postal & Courier', 'Mail and parcel', '📮', 'Medium', 'Steady', '$50,000', ARRAY['postal','courier','delivery'], ARRAY['reliability'], ARRAY['logistics']),
  ('Printing & Packaging', 'Print and packaging', '📦', 'Medium', 'Stable', '$55,000', ARRAY['printing','packaging'], ARRAY['precision'], ARRAY['design']),
  ('Funeral Services', 'Memorial services', '🕊️', 'Low', 'Stable', '$55,000', ARRAY['funeral','memorial'], ARRAY['empathy'], ARRAY['service']),
  ('Religious Organizations', 'Faith institutions', '⛪', 'Low', 'Stable', '$45,000', ARRAY['religion','faith'], ARRAY['empathy'], ARRAY['spirituality']),
  ('Fisheries & Aquaculture', 'Fishing industry', '🐟', 'Medium', 'Steady', '$55,000', ARRAY['fisheries','aquaculture'], ARRAY['outdoors'], ARRAY['ocean'])
ON CONFLICT (name) DO NOTHING;

-- Cross-mappings: career_paths
UPDATE public.career_paths cp SET related_industries = ARRAY(SELECT DISTINCT unnest(COALESCE(cp.related_industries, ARRAY[]::text[]) || sub.matched))
FROM (SELECT cp2.id, ARRAY_AGG(DISTINCT i.name) AS matched FROM public.career_paths cp2 CROSS JOIN public.industry_directory i WHERE cp2.keywords && i.keywords OR cp2.industry = i.name GROUP BY cp2.id) sub
WHERE cp.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.career_paths cp SET related_sectors = ARRAY(SELECT DISTINCT unnest(COALESCE(cp.related_sectors, ARRAY[]::text[]) || sub.matched))
FROM (SELECT cp2.id, ARRAY_AGG(DISTINCT s.name) AS matched FROM public.career_paths cp2 CROSS JOIN public.sector_directory s WHERE cp2.keywords && s.keywords OR cp2.sector = s.name GROUP BY cp2.id) sub
WHERE cp.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.career_paths cp SET related_skills = ARRAY(SELECT DISTINCT unnest(COALESCE(cp.related_skills, ARRAY[]::text[]) || sub.matched))
FROM (SELECT cp2.id, ARRAY_AGG(DISTINCT sk.name) AS matched FROM public.career_paths cp2 CROSS JOIN public.skills_directory sk WHERE cp2.keywords && sk.keywords GROUP BY cp2.id) sub
WHERE cp.id = sub.id AND sub.matched IS NOT NULL;

-- domain_directory
UPDATE public.domain_directory d SET related_industries = ARRAY(SELECT DISTINCT unnest(COALESCE(d.related_industries, ARRAY[]::text[]) || sub.matched))
FROM (SELECT d2.id, ARRAY_AGG(DISTINCT i.name) AS matched FROM public.domain_directory d2 CROSS JOIN public.industry_directory i WHERE d2.keywords && i.keywords OR d2.industry = i.name GROUP BY d2.id) sub
WHERE d.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.domain_directory d SET related_sectors = ARRAY(SELECT DISTINCT unnest(COALESCE(d.related_sectors, ARRAY[]::text[]) || sub.matched))
FROM (SELECT d2.id, ARRAY_AGG(DISTINCT s.name) AS matched FROM public.domain_directory d2 CROSS JOIN public.sector_directory s WHERE d2.keywords && s.keywords OR d2.sector = s.name GROUP BY d2.id) sub
WHERE d.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.domain_directory d SET related_skills = ARRAY(SELECT DISTINCT unnest(COALESCE(d.related_skills, ARRAY[]::text[]) || sub.matched))
FROM (SELECT d2.id, ARRAY_AGG(DISTINCT sk.name) AS matched FROM public.domain_directory d2 CROSS JOIN public.skills_directory sk WHERE d2.keywords && sk.keywords GROUP BY d2.id) sub
WHERE d.id = sub.id AND sub.matched IS NOT NULL;

-- industry_directory back-refs
UPDATE public.industry_directory i SET related_careers = ARRAY(SELECT DISTINCT unnest(COALESCE(i.related_careers, ARRAY[]::text[]) || sub.matched))
FROM (SELECT i2.id, ARRAY_AGG(DISTINCT cp.title) AS matched FROM public.industry_directory i2 CROSS JOIN public.career_paths cp WHERE i2.keywords && cp.keywords OR cp.industry = i2.name GROUP BY i2.id) sub
WHERE i.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.industry_directory i SET related_skills = ARRAY(SELECT DISTINCT unnest(COALESCE(i.related_skills, ARRAY[]::text[]) || sub.matched))
FROM (SELECT i2.id, ARRAY_AGG(DISTINCT sk.name) AS matched FROM public.industry_directory i2 CROSS JOIN public.skills_directory sk WHERE i2.keywords && sk.keywords GROUP BY i2.id) sub
WHERE i.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.industry_directory i SET related_domains = ARRAY(SELECT DISTINCT unnest(COALESCE(i.related_domains, ARRAY[]::text[]) || sub.matched))
FROM (SELECT i2.id, ARRAY_AGG(DISTINCT d.name) AS matched FROM public.industry_directory i2 CROSS JOIN public.domain_directory d WHERE i2.keywords && d.keywords OR d.industry = i2.name GROUP BY i2.id) sub
WHERE i.id = sub.id AND sub.matched IS NOT NULL;

-- sector_directory back-refs
UPDATE public.sector_directory s SET related_careers = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_careers, ARRAY[]::text[]) || sub.matched))
FROM (SELECT s2.id, ARRAY_AGG(DISTINCT cp.title) AS matched FROM public.sector_directory s2 CROSS JOIN public.career_paths cp WHERE s2.keywords && cp.keywords OR cp.sector = s2.name GROUP BY s2.id) sub
WHERE s.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.sector_directory s SET related_industries = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_industries, ARRAY[]::text[]) || sub.matched))
FROM (SELECT s2.id, ARRAY_AGG(DISTINCT i.name) AS matched FROM public.sector_directory s2 CROSS JOIN public.industry_directory i WHERE s2.keywords && i.keywords GROUP BY s2.id) sub
WHERE s.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.sector_directory s SET related_skills = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_skills, ARRAY[]::text[]) || sub.matched))
FROM (SELECT s2.id, ARRAY_AGG(DISTINCT sk.name) AS matched FROM public.sector_directory s2 CROSS JOIN public.skills_directory sk WHERE s2.keywords && sk.keywords GROUP BY s2.id) sub
WHERE s.id = sub.id AND sub.matched IS NOT NULL;

-- skills_directory back-refs
UPDATE public.skills_directory sk SET related_careers = ARRAY(SELECT DISTINCT unnest(COALESCE(sk.related_careers, ARRAY[]::text[]) || sub.matched))
FROM (SELECT sk2.id, ARRAY_AGG(DISTINCT cp.title) AS matched FROM public.skills_directory sk2 CROSS JOIN public.career_paths cp WHERE sk2.keywords && cp.keywords GROUP BY sk2.id) sub
WHERE sk.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.skills_directory sk SET related_industries = ARRAY(SELECT DISTINCT unnest(COALESCE(sk.related_industries, ARRAY[]::text[]) || sub.matched))
FROM (SELECT sk2.id, ARRAY_AGG(DISTINCT i.name) AS matched FROM public.skills_directory sk2 CROSS JOIN public.industry_directory i WHERE sk2.keywords && i.keywords GROUP BY sk2.id) sub
WHERE sk.id = sub.id AND sub.matched IS NOT NULL;

UPDATE public.skills_directory sk SET related_domains = ARRAY(SELECT DISTINCT unnest(COALESCE(sk.related_domains, ARRAY[]::text[]) || sub.matched))
FROM (SELECT sk2.id, ARRAY_AGG(DISTINCT d.name) AS matched FROM public.skills_directory sk2 CROSS JOIN public.domain_directory d WHERE sk2.keywords && d.keywords GROUP BY sk2.id) sub
WHERE sk.id = sub.id AND sub.matched IS NOT NULL;