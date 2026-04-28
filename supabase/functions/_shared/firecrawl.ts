// Shared Firecrawl helper for grounding AI generations with live web data.
// Used by roadmap-suggestions and roadmap-ai (and any future module that
// wants real-world course/role/salary context).

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

export type FirecrawlSearchResult = {
  url: string;
  title: string;
  description?: string;
};

export async function firecrawlSearch(
  query: string,
  opts: { limit?: number; country?: string; lang?: string } = {}
): Promise<FirecrawlSearchResult[]> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    console.warn("FIRECRAWL_API_KEY not configured — skipping web grounding");
    return [];
  }
  try {
    const res = await fetch(`${FIRECRAWL_V2}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: opts.limit ?? 5,
        country: opts.country ?? "in",
        lang: opts.lang ?? "en",
      }),
    });
    if (!res.ok) {
      console.warn("Firecrawl search failed:", res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = await res.json();
    const arr = data?.data || data?.web?.results || data?.results || [];
    return (arr as any[])
      .map((r) => ({
        url: r.url || r.link || "",
        title: r.title || r.name || "",
        description: r.description || r.snippet || r.summary || "",
      }))
      .filter((r) => r.url && r.title);
  } catch (e) {
    console.warn("Firecrawl search error:", e);
    return [];
  }
}

/**
 * Search for live courses/certifications/roles for a list of skills/areas.
 * Returns a compact array of {query, results} suitable for injection into
 * an AI grounding prompt.
 */
export async function gatherLiveContext(
  skills: string[],
  areasOfFocus: string[],
  industry?: string
): Promise<{ query: string; results: FirecrawlSearchResult[] }[]> {
  const queries: string[] = [];
  const top = (arr: string[], n: number) => arr.filter(Boolean).slice(0, n);

  top(skills, 3).forEach((s) =>
    queries.push(`best free online course to learn ${s} in India 2026 site:coursera.org OR site:youtube.com OR site:nptel.ac.in`)
  );
  top(areasOfFocus, 2).forEach((r) =>
    queries.push(`how to become a ${r} in India in 2026 step by step skills salary INR`)
  );
  if (industry) {
    queries.push(`${industry} entry level jobs India 2026 required skills`);
  }
  if (queries.length === 0) return [];

  // Cap to 5 parallel queries to respect rate-limit and keep latency sane
  const capped = queries.slice(0, 5);
  const results = await Promise.all(
    capped.map(async (q) => ({ query: q, results: await firecrawlSearch(q, { limit: 4 }) }))
  );
  return results.filter((r) => r.results.length > 0);
}
