-- Add missing relation and data columns to directory tables (to recover from incomplete migration and ensure database consistency)
ALTER TABLE public.industry_directory
  ADD COLUMN IF NOT EXISTS demand_level text,
  ADD COLUMN IF NOT EXISTS growth_trajectory text,
  ADD COLUMN IF NOT EXISTS avg_salary_usd text,
  ADD COLUMN IF NOT EXISTS soft_skills text[],
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS countries_in_demand text[],
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_countries text[],
  ADD COLUMN IF NOT EXISTS related_courses text[],
  ADD COLUMN IF NOT EXISTS related_domains text[],
  ADD COLUMN IF NOT EXISTS related_job_roles text[],
  ADD COLUMN IF NOT EXISTS related_sectors text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_subjects text[],
  ADD COLUMN IF NOT EXISTS related_universities text[];

ALTER TABLE public.sector_directory
  ADD COLUMN IF NOT EXISTS demand_level text,
  ADD COLUMN IF NOT EXISTS growth_trajectory text,
  ADD COLUMN IF NOT EXISTS avg_salary_usd text,
  ADD COLUMN IF NOT EXISTS soft_skills text[],
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS countries_in_demand text[],
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_domains text[],
  ADD COLUMN IF NOT EXISTS related_countries text[],
  ADD COLUMN IF NOT EXISTS related_courses text[],
  ADD COLUMN IF NOT EXISTS related_job_roles text[],
  ADD COLUMN IF NOT EXISTS related_sectors text[],
  ADD COLUMN IF NOT EXISTS related_subjects text[],
  ADD COLUMN IF NOT EXISTS related_universities text[];

ALTER TABLE public.subjects_directory
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_countries text[],
  ADD COLUMN IF NOT EXISTS related_courses text[],
  ADD COLUMN IF NOT EXISTS related_domains text[],
  ADD COLUMN IF NOT EXISTS related_job_roles text[],
  ADD COLUMN IF NOT EXISTS related_sectors text[],
  ADD COLUMN IF NOT EXISTS related_subjects text[],
  ADD COLUMN IF NOT EXISTS related_universities text[],
  ADD COLUMN IF NOT EXISTS countries_in_demand text[];

ALTER TABLE public.skills_directory
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_domains text[],
  ADD COLUMN IF NOT EXISTS related_countries text[],
  ADD COLUMN IF NOT EXISTS related_courses text[],
  ADD COLUMN IF NOT EXISTS related_job_roles text[],
  ADD COLUMN IF NOT EXISTS related_sectors text[],
  ADD COLUMN IF NOT EXISTS related_subjects text[],
  ADD COLUMN IF NOT EXISTS related_universities text[],
  ADD COLUMN IF NOT EXISTS countries_in_demand text[];

ALTER TABLE public.career_paths
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_countries text[],
  ADD COLUMN IF NOT EXISTS related_courses text[],
  ADD COLUMN IF NOT EXISTS related_domains text[],
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_job_roles text[],
  ADD COLUMN IF NOT EXISTS related_sectors text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_subjects text[],
  ADD COLUMN IF NOT EXISTS related_universities text[],
  ADD COLUMN IF NOT EXISTS demand_level text,
  ADD COLUMN IF NOT EXISTS growth_trajectory text,
  ADD COLUMN IF NOT EXISTS avg_salary_usd text,
  ADD COLUMN IF NOT EXISTS soft_skills text[],
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS countries_in_demand text[],
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS industry_trends text,
  ADD COLUMN IF NOT EXISTS salary_range text,
  ADD COLUMN IF NOT EXISTS tools_certifications text[];

ALTER TABLE public.domain_directory
  ADD COLUMN IF NOT EXISTS related_careers text[],
  ADD COLUMN IF NOT EXISTS related_countries text[],
  ADD COLUMN IF NOT EXISTS related_courses text[],
  ADD COLUMN IF NOT EXISTS related_domains text[],
  ADD COLUMN IF NOT EXISTS related_industries text[],
  ADD COLUMN IF NOT EXISTS related_job_roles text[],
  ADD COLUMN IF NOT EXISTS related_sectors text[],
  ADD COLUMN IF NOT EXISTS related_skills text[],
  ADD COLUMN IF NOT EXISTS related_subjects text[],
  ADD COLUMN IF NOT EXISTS related_universities text[],
  ADD COLUMN IF NOT EXISTS demand_level text,
  ADD COLUMN IF NOT EXISTS growth_trajectory text,
  ADD COLUMN IF NOT EXISTS avg_salary_usd text,
  ADD COLUMN IF NOT EXISTS soft_skills text[],
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS countries_in_demand text[],
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS parent_domain text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS sector text;

ALTER TABLE public.universities_directory
  ADD COLUMN IF NOT EXISTS related_careers text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_countries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_courses text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_domains text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_industries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_job_roles text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_sectors text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_subjects text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_universities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS soft_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

ALTER TABLE public.job_roles_directory
  ADD COLUMN IF NOT EXISTS related_careers text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_countries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_courses text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_domains text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_industries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_job_roles text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_sectors text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_subjects text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_universities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS soft_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS countries_in_demand text[] DEFAULT '{}';

-- SKILLS ⇄ everything

UPDATE public.skills_directory s SET
  related_industries = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_industries,'{}') || sub.matched)),
  related_sectors    = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_sectors,'{}')    || sub.matched_sec)),
  related_domains    = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_domains,'{}')    || sub.matched_dom)),
  related_careers    = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_careers,'{}')    || sub.matched_car)),
  related_job_roles  = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_job_roles,'{}')  || sub.matched_jr)),
  related_subjects   = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_subjects,'{}')   || sub.matched_sub)),
  related_courses    = ARRAY(SELECT DISTINCT unnest(COALESCE(s.related_courses,'{}')    || sub.matched_co))
FROM (
  SELECT s2.id,
    COALESCE(ARRAY_AGG(DISTINCT i.name)   FILTER (WHERE i.name IS NOT NULL), '{}') AS matched,
    COALESCE(ARRAY_AGG(DISTINCT sec.name) FILTER (WHERE sec.name IS NOT NULL), '{}') AS matched_sec,
    COALESCE(ARRAY_AGG(DISTINCT d.name)   FILTER (WHERE d.name IS NOT NULL), '{}') AS matched_dom,
    COALESCE(ARRAY_AGG(DISTINCT cp.title) FILTER (WHERE cp.title IS NOT NULL), '{}') AS matched_car,
    COALESCE(ARRAY_AGG(DISTINCT jr.title) FILTER (WHERE jr.title IS NOT NULL), '{}') AS matched_jr,
    COALESCE(ARRAY_AGG(DISTINCT sub.name) FILTER (WHERE sub.name IS NOT NULL), '{}') AS matched_sub,
    COALESCE(ARRAY_AGG(DISTINCT co.name)  FILTER (WHERE co.name IS NOT NULL), '{}') AS matched_co
  FROM public.skills_directory s2
  LEFT JOIN public.industry_directory       i   ON s2.keywords && i.keywords
  LEFT JOIN public.sector_directory         sec ON s2.keywords && sec.keywords
  LEFT JOIN public.domain_directory         d   ON s2.keywords && d.keywords OR s2.domain = d.name
  LEFT JOIN public.career_paths             cp  ON s2.keywords && cp.keywords OR s2.name = ANY(COALESCE(cp.related_skills,'{}'))
  LEFT JOIN public.job_roles_directory      jr  ON s2.keywords && jr.keywords OR s2.name = ANY(COALESCE(jr.skills_required,'{}'))
  LEFT JOIN public.subjects_directory       sub ON s2.keywords && sub.keywords
  LEFT JOIN public.online_courses_directory co  ON s2.keywords && co.keywords OR s2.domain = co.domain
  GROUP BY s2.id
) sub
WHERE s.id = sub.id;

-- SUBJECTS ⇄ everything
UPDATE public.subjects_directory sub SET
  related_domains      = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_domains,'{}')      || x.matched_dom)),
  related_sectors      = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_sectors,'{}')      || x.matched_sec)),
  related_industries   = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_industries,'{}')   || x.matched_ind)),
  related_careers      = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_careers,'{}')      || x.matched_car)),
  related_job_roles    = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_job_roles,'{}')    || x.matched_jr)),
  related_skills       = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_skills,'{}')       || x.matched_sk)),
  related_universities = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_universities,'{}') || x.matched_uni)),
  related_courses      = ARRAY(SELECT DISTINCT unnest(COALESCE(sub.related_courses,'{}')      || x.matched_co))
FROM (
  SELECT sub2.id,
    COALESCE(ARRAY_AGG(DISTINCT d.name)   FILTER (WHERE d.name IS NOT NULL), '{}') AS matched_dom,
    COALESCE(ARRAY_AGG(DISTINCT sec.name) FILTER (WHERE sec.name IS NOT NULL), '{}') AS matched_sec,
    COALESCE(ARRAY_AGG(DISTINCT i.name)   FILTER (WHERE i.name IS NOT NULL), '{}') AS matched_ind,
    COALESCE(ARRAY_AGG(DISTINCT cp.title) FILTER (WHERE cp.title IS NOT NULL), '{}') AS matched_car,
    COALESCE(ARRAY_AGG(DISTINCT jr.title) FILTER (WHERE jr.title IS NOT NULL), '{}') AS matched_jr,
    COALESCE(ARRAY_AGG(DISTINCT sk.name)  FILTER (WHERE sk.name IS NOT NULL), '{}') AS matched_sk,
    COALESCE(ARRAY_AGG(DISTINCT u.name)   FILTER (WHERE u.name IS NOT NULL), '{}') AS matched_uni,
    COALESCE(ARRAY_AGG(DISTINCT co.name)  FILTER (WHERE co.name IS NOT NULL), '{}') AS matched_co
  FROM public.subjects_directory sub2
  LEFT JOIN public.domain_directory       d   ON sub2.keywords && d.keywords OR sub2.domain = d.name
  LEFT JOIN public.sector_directory       sec ON sub2.keywords && sec.keywords
  LEFT JOIN public.industry_directory     i   ON sub2.keywords && i.keywords
  LEFT JOIN public.career_paths           cp  ON sub2.keywords && cp.keywords
  LEFT JOIN public.job_roles_directory    jr  ON sub2.keywords && jr.keywords
  LEFT JOIN public.skills_directory       sk  ON sub2.keywords && sk.keywords
  LEFT JOIN public.universities_directory u   ON sub2.keywords && u.keywords
  LEFT JOIN public.online_courses_directory co ON sub2.keywords && co.keywords
  GROUP BY sub2.id
) x
WHERE sub.id = x.id;

-- ONLINE COURSES ⇄ skills/domains/universities
UPDATE public.online_courses_directory co SET
  related_skills       = ARRAY(SELECT DISTINCT unnest(COALESCE(co.related_skills,'{}')       || x.matched_sk)),
  related_domains      = ARRAY(SELECT DISTINCT unnest(COALESCE(co.related_domains,'{}')      || x.matched_dom)),
  related_universities = ARRAY(SELECT DISTINCT unnest(COALESCE(co.related_universities,'{}') || x.matched_uni))
FROM (
  SELECT co2.id,
    COALESCE(ARRAY_AGG(DISTINCT sk.name) FILTER (WHERE sk.name IS NOT NULL), '{}') AS matched_sk,
    COALESCE(ARRAY_AGG(DISTINCT d.name)  FILTER (WHERE d.name IS NOT NULL), '{}') AS matched_dom,
    COALESCE(ARRAY_AGG(DISTINCT u.name)  FILTER (WHERE u.name IS NOT NULL), '{}') AS matched_uni
  FROM public.online_courses_directory co2
  LEFT JOIN public.skills_directory sk ON co2.keywords && sk.keywords OR co2.domain = sk.domain
  LEFT JOIN public.domain_directory d  ON co2.keywords && d.keywords  OR co2.domain = d.name
  LEFT JOIN public.universities_directory u ON co2.keywords && u.keywords
  GROUP BY co2.id
) x
WHERE co.id = x.id;

-- UNIVERSITIES ⇄ subjects/careers/countries
UPDATE public.universities_directory u SET
  related_subjects  = ARRAY(SELECT DISTINCT unnest(COALESCE(u.related_subjects,'{}')  || x.matched_sub)),
  related_careers   = ARRAY(SELECT DISTINCT unnest(COALESCE(u.related_careers,'{}')   || x.matched_car)),
  related_countries = ARRAY(SELECT DISTINCT unnest(COALESCE(u.related_countries,'{}') || x.matched_ctry))
FROM (
  SELECT u2.id,
    COALESCE(ARRAY_AGG(DISTINCT sub.name) FILTER (WHERE sub.name IS NOT NULL), '{}') AS matched_sub,
    COALESCE(ARRAY_AGG(DISTINCT cp.title) FILTER (WHERE cp.title IS NOT NULL), '{}') AS matched_car,
    COALESCE(ARRAY_AGG(DISTINCT c.name)   FILTER (WHERE c.name IS NOT NULL), '{}') AS matched_ctry
  FROM public.universities_directory u2
  LEFT JOIN public.subjects_directory sub ON u2.keywords && sub.keywords
  LEFT JOIN public.career_paths       cp  ON u2.keywords && cp.keywords
  LEFT JOIN public.countries_directory c  ON u2.country = c.name
  GROUP BY u2.id
) x
WHERE u.id = x.id;

-- COUNTRIES ⇄ universities/careers/skills
UPDATE public.countries_directory c SET
  top_universities = ARRAY(SELECT DISTINCT unnest(COALESCE(c.top_universities,'{}') || x.matched_uni)),
  top_careers      = ARRAY(SELECT DISTINCT unnest(COALESCE(c.top_careers,'{}')      || x.matched_car)),
  top_skills       = ARRAY(SELECT DISTINCT unnest(COALESCE(c.top_skills,'{}')       || x.matched_sk))
FROM (
  SELECT c2.id,
    COALESCE(ARRAY_AGG(DISTINCT u.name)   FILTER (WHERE u.name IS NOT NULL), '{}') AS matched_uni,
    COALESCE(ARRAY_AGG(DISTINCT cp.title) FILTER (WHERE cp.title IS NOT NULL), '{}') AS matched_car,
    COALESCE(ARRAY_AGG(DISTINCT sk.name)  FILTER (WHERE sk.name IS NOT NULL), '{}') AS matched_sk
  FROM public.countries_directory c2
  LEFT JOIN public.universities_directory u  ON u.country = c2.name
  LEFT JOIN public.career_paths       cp ON c2.name = ANY(COALESCE(cp.countries_in_demand,'{}'))
  LEFT JOIN public.skills_directory   sk ON c2.name = ANY(COALESCE(sk.countries_in_demand,'{}'))
  GROUP BY c2.id
) x
WHERE c.id = x.id;

-- JOB ROLES ⇄ skills/careers
UPDATE public.job_roles_directory jr SET
  related_skills  = ARRAY(SELECT DISTINCT unnest(COALESCE(jr.related_skills,'{}')  || x.matched_sk)),
  related_careers = ARRAY(SELECT DISTINCT unnest(COALESCE(jr.related_careers,'{}') || x.matched_car))
FROM (
  SELECT jr2.id,
    COALESCE(ARRAY_AGG(DISTINCT sk.name)  FILTER (WHERE sk.name IS NOT NULL), '{}') AS matched_sk,
    COALESCE(ARRAY_AGG(DISTINCT cp.title) FILTER (WHERE cp.title IS NOT NULL), '{}') AS matched_car
  FROM public.job_roles_directory jr2
  LEFT JOIN public.skills_directory sk ON jr2.keywords && sk.keywords
  LEFT JOIN public.career_paths     cp ON jr2.keywords && cp.keywords OR jr2.domain = cp.domain
  GROUP BY jr2.id
) x
WHERE jr.id = x.id;

-- CAREERS back-fill
UPDATE public.career_paths cp SET
  related_skills   = ARRAY(SELECT DISTINCT unnest(COALESCE(cp.related_skills,'{}')   || x.matched_sk)),
  related_subjects = ARRAY(SELECT DISTINCT unnest(COALESCE(cp.related_subjects,'{}') || x.matched_sub)),
  related_courses  = ARRAY(SELECT DISTINCT unnest(COALESCE(cp.related_courses,'{}')  || x.matched_co))
FROM (
  SELECT cp2.id,
    COALESCE(ARRAY_AGG(DISTINCT sk.name)  FILTER (WHERE sk.name IS NOT NULL), '{}') AS matched_sk,
    COALESCE(ARRAY_AGG(DISTINCT sub.name) FILTER (WHERE sub.name IS NOT NULL), '{}') AS matched_sub,
    COALESCE(ARRAY_AGG(DISTINCT co.name)  FILTER (WHERE co.name IS NOT NULL), '{}') AS matched_co
  FROM public.career_paths cp2
  LEFT JOIN public.skills_directory   sk  ON cp2.keywords && sk.keywords
  LEFT JOIN public.subjects_directory sub ON cp2.keywords && sub.keywords
  LEFT JOIN public.online_courses_directory co ON cp2.keywords && co.keywords OR cp2.domain = co.domain
  GROUP BY cp2.id
) x
WHERE cp.id = x.id;

-- DOMAINS back-fill
UPDATE public.domain_directory d SET
  related_skills   = ARRAY(SELECT DISTINCT unnest(COALESCE(d.related_skills,'{}')   || x.matched_sk)),
  related_subjects = ARRAY(SELECT DISTINCT unnest(COALESCE(d.related_subjects,'{}') || x.matched_sub)),
  related_courses  = ARRAY(SELECT DISTINCT unnest(COALESCE(d.related_courses,'{}')  || x.matched_co))
FROM (
  SELECT d2.id,
    COALESCE(ARRAY_AGG(DISTINCT sk.name)  FILTER (WHERE sk.name IS NOT NULL), '{}') AS matched_sk,
    COALESCE(ARRAY_AGG(DISTINCT sub.name) FILTER (WHERE sub.name IS NOT NULL), '{}') AS matched_sub,
    COALESCE(ARRAY_AGG(DISTINCT co.name)  FILTER (WHERE co.name IS NOT NULL), '{}') AS matched_co
  FROM public.domain_directory d2
  LEFT JOIN public.skills_directory   sk  ON d2.keywords && sk.keywords OR d2.name = sk.domain
  LEFT JOIN public.subjects_directory sub ON d2.keywords && sub.keywords OR d2.name = sub.domain
  LEFT JOIN public.online_courses_directory co ON d2.keywords && co.keywords OR d2.name = co.domain
  GROUP BY d2.id
) x
WHERE d.id = x.id;
