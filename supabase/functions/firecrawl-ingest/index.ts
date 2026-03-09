import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, query, limit = 10 } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let results: any[] = [];
    let insertedCount = 0;

    // ─── Scrape career data based on type ────────────────────────────────────
    if (type === "career_paths") {
      // Search for career paths data
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "career paths list 2024 job titles professions",
          limit,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!searchResponse.ok) {
        const err = await searchResponse.text();
        console.error("Firecrawl search error:", err);
        throw new Error("Firecrawl search failed");
      }

      const searchData = await searchResponse.json();
      results = searchData.data || [];

      // Parse and insert career paths
      for (const result of results) {
        const parsed = parseCareerPathsFromMarkdown(result.markdown || "", result.url);
        for (const path of parsed) {
          const { error } = await supabase.from("career_paths").upsert({
            title: path.title,
            domain: path.domain || "General",
            description: path.description,
            related_skills: path.skills,
            demand_level: path.demand_level,
            keywords: path.keywords,
          }, { onConflict: "title" });
          if (!error) insertedCount++;
        }
      }
    } else if (type === "job_roles") {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "job roles titles list by industry sector 2024",
          limit,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!searchResponse.ok) throw new Error("Firecrawl search failed");
      const searchData = await searchResponse.json();
      results = searchData.data || [];

      for (const result of results) {
        const parsed = parseJobRolesFromMarkdown(result.markdown || "", result.url);
        for (const role of parsed) {
          const { error } = await supabase.from("job_roles_directory").upsert({
            title: role.title,
            domain: role.domain || "General",
            description: role.description,
            skills_required: role.skills,
            demand_level: role.demand_level,
            experience_level: role.experience_level,
          }, { onConflict: "title" });
          if (!error) insertedCount++;
        }
      }
    } else if (type === "domains") {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "industry sectors domains career fields list",
          limit,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!searchResponse.ok) throw new Error("Firecrawl search failed");
      const searchData = await searchResponse.json();
      results = searchData.data || [];

      for (const result of results) {
        const parsed = parseDomainsFromMarkdown(result.markdown || "");
        for (const domain of parsed) {
          const { error } = await supabase.from("domain_directory").upsert({
            name: domain.name,
            category: domain.category || "Industry",
            description: domain.description,
            keywords: domain.keywords,
          }, { onConflict: "name" });
          if (!error) insertedCount++;
        }
      }
    } else if (type === "skills") {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "professional skills list in-demand skills 2024",
          limit,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!searchResponse.ok) throw new Error("Firecrawl search failed");
      const searchData = await searchResponse.json();
      results = searchData.data || [];

      for (const result of results) {
        const parsed = parseSkillsFromMarkdown(result.markdown || "");
        for (const skill of parsed) {
          const { error } = await supabase.from("skills_directory").upsert({
            name: skill.name,
            category: skill.category || "Professional",
            description: skill.description,
            related_domains: skill.domains,
            demand_level: skill.demand_level,
          }, { onConflict: "name" });
          if (!error) insertedCount++;
        }
      }
    } else if (type === "universities") {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "top universities colleges list programs degrees",
          limit,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!searchResponse.ok) throw new Error("Firecrawl search failed");
      const searchData = await searchResponse.json();
      results = searchData.data || [];

      for (const result of results) {
        const parsed = parseUniversitiesFromMarkdown(result.markdown || "");
        for (const uni of parsed) {
          const { error } = await supabase.from("universities_directory").upsert({
            name: uni.name,
            country: uni.country || "Unknown",
            description: uni.description,
            notable_programs: uni.programs,
            ranking_tier: uni.ranking_tier,
          }, { onConflict: "name" });
          if (!error) insertedCount++;
        }
      }
    } else if (type === "courses") {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "online courses certifications professional development",
          limit,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!searchResponse.ok) throw new Error("Firecrawl search failed");
      const searchData = await searchResponse.json();
      results = searchData.data || [];

      for (const result of results) {
        const parsed = parseCoursesFromMarkdown(result.markdown || "", result.url);
        for (const course of parsed) {
          const { error } = await supabase.from("courses_directory").upsert({
            title: course.title,
            provider: course.provider || "Unknown",
            description: course.description,
            skills_taught: course.skills,
            duration: course.duration,
            url: course.url,
            is_free: course.is_free,
          }, { onConflict: "title,provider" });
          if (!error) insertedCount++;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      type,
      sources_scraped: results.length,
      items_inserted: insertedCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("firecrawl-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── Parser functions ────────────────────────────────────────────────────────

function parseCareerPathsFromMarkdown(markdown: string, sourceUrl: string): any[] {
  const paths: any[] = [];
  const lines = markdown.split("\n");
  
  // Look for list items, headers, or structured content
  const titlePatterns = [
    /^[-*]\s*\*?\*?([A-Z][^*\n]+?)\*?\*?\s*[-–:]?\s*(.*)$/gm,
    /^#{1,3}\s*([A-Z][^\n]+)$/gm,
    /^\d+\.\s*\*?\*?([A-Z][^*\n]+?)\*?\*?\s*[-–:]?\s*(.*)$/gm,
  ];

  for (const pattern of titlePatterns) {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      const title = match[1].trim().replace(/\*+/g, "").slice(0, 100);
      if (title.length > 3 && !title.includes("http") && !title.includes("Click")) {
        paths.push({
          title,
          description: match[2]?.trim() || `Career path in ${title}`,
          domain: inferDomain(title),
          skills: extractSkillsFromText(markdown.slice(match.index, match.index + 500)),
          demand_level: "medium",
          keywords: title.toLowerCase().split(/\s+/).filter(w => w.length > 3),
        });
      }
      if (paths.length >= 20) break;
    }
    if (paths.length >= 20) break;
  }

  return paths.slice(0, 20);
}

function parseJobRolesFromMarkdown(markdown: string, sourceUrl: string): any[] {
  const roles: any[] = [];
  const lines = markdown.split("\n");

  const patterns = [
    /^[-*]\s*\*?\*?([A-Z][^*\n]+?(?:Engineer|Developer|Manager|Analyst|Designer|Specialist|Coordinator|Director|Lead|Architect|Consultant))\*?\*?/gm,
    /^\d+\.\s*\*?\*?([A-Z][^*\n]+?(?:Engineer|Developer|Manager|Analyst|Designer|Specialist))\*?\*?/gm,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      const title = match[1].trim().replace(/\*+/g, "").slice(0, 100);
      if (title.length > 5) {
        roles.push({
          title,
          description: `Professional role: ${title}`,
          domain: inferDomain(title),
          skills: extractSkillsFromText(markdown.slice(match.index, match.index + 500)),
          demand_level: "medium",
          experience_level: inferExperienceLevel(title),
        });
      }
      if (roles.length >= 20) break;
    }
  }

  return roles.slice(0, 20);
}

function parseDomainsFromMarkdown(markdown: string): any[] {
  const domains: any[] = [];
  const commonDomains = [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Marketing", "Legal", "Engineering", "Design",
    "Data Science", "Artificial Intelligence", "Cybersecurity", "Cloud Computing",
    "Digital Marketing", "Human Resources", "Supply Chain", "Consulting",
  ];

  for (const domain of commonDomains) {
    if (markdown.toLowerCase().includes(domain.toLowerCase())) {
      domains.push({
        name: domain,
        category: "Industry",
        description: `Professional domain focusing on ${domain}`,
        keywords: domain.toLowerCase().split(/\s+/),
      });
    }
  }

  return domains;
}

function parseSkillsFromMarkdown(markdown: string): any[] {
  const skills: any[] = [];
  const commonSkills = [
    "Python", "JavaScript", "SQL", "Excel", "Communication",
    "Leadership", "Project Management", "Data Analysis", "Machine Learning",
    "Cloud Computing", "Agile", "Problem Solving", "Critical Thinking",
    "Teamwork", "Time Management", "Presentation", "Negotiation",
  ];

  for (const skill of commonSkills) {
    if (markdown.toLowerCase().includes(skill.toLowerCase())) {
      skills.push({
        name: skill,
        category: skill.match(/Python|JavaScript|SQL|Excel/) ? "Technical" : "Soft Skill",
        description: `Professional skill: ${skill}`,
        domains: [],
        demand_level: "high",
      });
    }
  }

  return skills;
}

function parseUniversitiesFromMarkdown(markdown: string): any[] {
  const universities: any[] = [];
  const uniPatterns = [
    /(?:University of|MIT|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Berkeley|Oxford|Cambridge|UCLA|NYU|USC|Duke|Northwestern)\s*[A-Za-z\s]*/gi,
  ];

  for (const pattern of uniPatterns) {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      const name = match[0].trim().slice(0, 100);
      if (name.length > 5 && !universities.find(u => u.name === name)) {
        universities.push({
          name,
          country: name.includes("Oxford") || name.includes("Cambridge") ? "UK" : "USA",
          description: `Higher education institution: ${name}`,
          programs: [],
          ranking_tier: "top",
        });
      }
      if (universities.length >= 20) break;
    }
  }

  return universities.slice(0, 20);
}

function parseCoursesFromMarkdown(markdown: string, sourceUrl: string): any[] {
  const courses: any[] = [];
  const coursePatterns = [
    /(?:Course|Certificate|Program|Bootcamp|Training):\s*([^\n]+)/gi,
    /Learn\s+([A-Z][^\n]{10,50})/g,
  ];

  for (const pattern of coursePatterns) {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      const title = match[1].trim().slice(0, 150);
      if (title.length > 5) {
        courses.push({
          title,
          provider: inferProvider(sourceUrl),
          description: `Professional course: ${title}`,
          skills: extractSkillsFromText(title),
          duration: "Self-paced",
          url: sourceUrl,
          is_free: markdown.toLowerCase().includes("free"),
        });
      }
      if (courses.length >= 15) break;
    }
  }

  return courses.slice(0, 15);
}

function inferDomain(text: string): string {
  const domainMap: Record<string, string[]> = {
    "Technology": ["software", "developer", "engineer", "data", "IT", "tech", "cloud", "web", "mobile", "AI"],
    "Healthcare": ["medical", "health", "nurse", "doctor", "clinical", "patient", "hospital"],
    "Finance": ["financial", "banking", "investment", "accounting", "audit", "tax"],
    "Marketing": ["marketing", "brand", "digital", "content", "social media", "SEO"],
    "Design": ["design", "UX", "UI", "graphic", "creative", "visual"],
    "Management": ["manager", "director", "lead", "executive", "chief"],
  };

  const lowerText = text.toLowerCase();
  for (const [domain, keywords] of Object.entries(domainMap)) {
    if (keywords.some(k => lowerText.includes(k))) {
      return domain;
    }
  }
  return "General";
}

function inferExperienceLevel(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("senior") || lowerTitle.includes("lead") || lowerTitle.includes("principal")) {
    return "Senior";
  }
  if (lowerTitle.includes("junior") || lowerTitle.includes("entry") || lowerTitle.includes("associate")) {
    return "Entry";
  }
  if (lowerTitle.includes("director") || lowerTitle.includes("chief") || lowerTitle.includes("vp")) {
    return "Executive";
  }
  return "Mid";
}

function inferProvider(url: string): string {
  if (url.includes("coursera")) return "Coursera";
  if (url.includes("udemy")) return "Udemy";
  if (url.includes("linkedin")) return "LinkedIn Learning";
  if (url.includes("edx")) return "edX";
  if (url.includes("freecodecamp")) return "freeCodeCamp";
  return "Various";
}

function extractSkillsFromText(text: string): string[] {
  const skills: string[] = [];
  const skillPatterns = [
    /Python|JavaScript|Java|C\+\+|SQL|React|Node\.js|AWS|Azure|Docker|Kubernetes/gi,
    /Excel|PowerPoint|Tableau|Power BI|Salesforce|SAP/gi,
    /communication|leadership|teamwork|problem.solving|analytical/gi,
  ];

  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skill = match[0];
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
  }

  return skills.slice(0, 10);
}
