import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  X,
  Briefcase,
  Layers,
  Globe,
  GraduationCap,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import { CareerCard, DomainCard, JobCard, UniversityCard } from "./search/DirectorySearchCards";
import { DirectoryResultsTable } from "./search/DirectoryResultsTable";
import { SkillResults } from "./search/SkillResults";
import type { DirectoryMode, DirectoryResults, DirectoryView } from "./search/types";

export type { DirectoryMode } from "./search/types";

interface DirectorySearchProps {
  mode?: DirectoryMode;
  placeholder?: string;
  onSelect?: (item: any, type: string) => void;
  maxResults?: number;
  inline?: boolean;
  showTabs?: boolean;
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
}

const DirectorySearch = ({
  mode = "all",
  placeholder,
  onSelect,
  maxResults = 12,
  inline = false,
  showTabs = false,
  className = "",
  autoFocus = false,
  initialQuery = "",
}: DirectorySearchProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<DirectoryMode>(mode === "all" ? "careers" : mode);
  const [allData, setAllData] = useState<DirectoryResults>({ careers: [], jobs: [], domains: [], universities: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<DirectoryView>("cards");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const data: DirectoryResults = { careers: [], jobs: [], domains: [], universities: [] };

    const [cp, jr, dd, ud] = await Promise.all([
      mode === "all" || mode === "careers"
        ? supabase.from("career_paths").select("*").order("title")
        : Promise.resolve({ data: [] }),
      mode === "all" || mode === "jobs" || mode === "skills"
        ? supabase.from("job_roles_directory").select("*").order("title")
        : Promise.resolve({ data: [] }),
      mode === "all" || mode === "domains"
        ? supabase.from("domain_directory").select("*").order("name")
        : Promise.resolve({ data: [] }),
      mode === "all" || mode === "universities"
        ? supabase.from("universities_directory").select("*").order("name")
        : Promise.resolve({ data: [] }),
    ]);

    data.careers = cp.data || [];
    data.jobs = jr.data || [];
    data.domains = dd.data || [];
    data.universities = ud.data || [];

    setAllData(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const s = query.toLowerCase().trim();
    if (!s) return allData;

    return {
      careers: allData.careers.filter(
        (c) =>
          c.title?.toLowerCase().includes(s) ||
          c.domain?.toLowerCase().includes(s) ||
          c.description?.toLowerCase().includes(s) ||
          c.related_skills?.some((sk: string) => sk.toLowerCase().includes(s)) ||
          c.keywords?.some((k: string) => k.toLowerCase().includes(s)),
      ),
      jobs: allData.jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(s) ||
          j.domain?.toLowerCase().includes(s) ||
          j.description?.toLowerCase().includes(s) ||
          j.skills_required?.some((sk: string) => sk.toLowerCase().includes(s)) ||
          j.career_path_keywords?.some((k: string) => k.toLowerCase().includes(s)),
      ),
      domains: allData.domains.filter(
        (d) =>
          d.name?.toLowerCase().includes(s) ||
          d.category?.toLowerCase().includes(s) ||
          d.description?.toLowerCase().includes(s) ||
          d.keywords?.some((k: string) => k.toLowerCase().includes(s)),
      ),
      universities: allData.universities.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.country?.toLowerCase().includes(s) ||
          u.city?.toLowerCase().includes(s) ||
          u.continent?.toLowerCase().includes(s),
      ),
    };
  }, [query, allData]);

  const totalResults =
    filtered.careers.length + filtered.jobs.length + filtered.domains.length + filtered.universities.length;

  const tabConfig = [
    { key: "careers" as const, label: "Careers", icon: Briefcase, count: filtered.careers.length },
    { key: "jobs" as const, label: "Jobs", icon: Layers, count: filtered.jobs.length },
    { key: "domains" as const, label: "Domains", icon: Globe, count: filtered.domains.length },
    { key: "universities" as const, label: "Universities", icon: GraduationCap, count: filtered.universities.length },
  ].filter((t) => mode === "all" || t.key === mode || (mode === "skills" && t.key === "jobs"));

  const visibleResults = (() => {
    if (mode === "skills") {
      const skillSet = new Set<string>();
      filtered.jobs.forEach((j) => j.skills_required?.forEach((s: string) => skillSet.add(s)));
      return Array.from(skillSet)
        .slice(0, maxResults)
        .map((s) => ({ type: "skill", title: s }));
    }
    const tab = activeTab === "all" ? "careers" : activeTab;
    const items = filtered[tab as keyof DirectoryResults] || [];
    return items.slice(0, maxResults);
  })();

  const activeNonSkillTab = (activeTab === "all" ? "careers" : activeTab) as
    | "careers"
    | "jobs"
    | "domains"
    | "universities";

  const defaultPlaceholder =
    {
      all: "Search careers, jobs, domains, universities...",
      careers: "Search career paths...",
      jobs: "Search job roles...",
      domains: "Search domains...",
      universities: "Search universities...",
      skills: "Search skills...",
    }[mode] || "Search...";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder || defaultPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 text-base bg-card border-border"
          autoFocus={autoFocus}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Result count */}
      {query && (
        <p className="text-xs text-muted-foreground font-body">
          {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
        </p>
      )}

      {/* Tabs */}
      {showTabs && tabConfig.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {tabConfig.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              type="button"
            >
              <t.icon size={12} />
              {t.label}
              <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* View toggle */}
      {mode !== "skills" && visibleResults.length > 0 && (
        <div className="flex items-center justify-end">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "cards" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table2 size={14} /> Table
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse font-body text-sm text-muted-foreground">Loading directory...</div>
        </div>
      ) : mode === "skills" ? (
        <SkillResults items={visibleResults} onSelect={onSelect} />
      ) : view === "table" ? (
        <div className="rounded-xl border border-border bg-card">
          <DirectoryResultsTable activeTab={activeNonSkillTab} items={visibleResults} onSelect={onSelect} />
        </div>
      ) : (
        <div className={inline ? "space-y-2" : "grid gap-3 md:grid-cols-2 lg:grid-cols-3"}>
          <AnimatePresence mode="popLayout">
            {visibleResults.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.015 }}
              >
                {activeNonSkillTab === "careers" && <CareerCard item={item} onSelect={onSelect} />}
                {activeNonSkillTab === "jobs" && <JobCard item={item} onSelect={onSelect} />}
                {activeNonSkillTab === "domains" && <DomainCard item={item} onSelect={onSelect} />}
                {activeNonSkillTab === "universities" && <UniversityCard item={item} onSelect={onSelect} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && visibleResults.length === 0 && (
        <div className="text-center py-10 bg-card rounded-xl border border-border">
          <Search className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="font-display text-foreground text-sm">No results found</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

export default DirectorySearch;


export type DirectoryMode = "all" | "careers" | "jobs" | "domains" | "universities" | "skills";

interface DirectorySearchProps {
  mode?: DirectoryMode;
  placeholder?: string;
  onSelect?: (item: any, type: string) => void;
  maxResults?: number;
  inline?: boolean;
  showTabs?: boolean;
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
}

interface DirectoryResults {
  careers: any[];
  jobs: any[];
  domains: any[];
  universities: any[];
}

const DirectorySearch = ({
  mode = "all",
  placeholder,
  onSelect,
  maxResults = 12,
  inline = false,
  showTabs = false,
  className = "",
  autoFocus = false,
  initialQuery = "",
}: DirectorySearchProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<DirectoryMode>(mode === "all" ? "careers" : mode);
  const [results, setResults] = useState<DirectoryResults>({ careers: [], jobs: [], domains: [], universities: [] });
  const [allData, setAllData] = useState<DirectoryResults>({ careers: [], jobs: [], domains: [], universities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data: any = { careers: [], jobs: [], domains: [], universities: [] };

    const [cp, jr, dd, ud] = await Promise.all([
      (mode === "all" || mode === "careers") ? supabase.from("career_paths").select("*").order("title") : Promise.resolve({ data: [] }),
      (mode === "all" || mode === "jobs" || mode === "skills") ? supabase.from("job_roles_directory").select("*").order("title") : Promise.resolve({ data: [] }),
      (mode === "all" || mode === "domains") ? supabase.from("domain_directory").select("*").order("name") : Promise.resolve({ data: [] }),
      (mode === "all" || mode === "universities") ? supabase.from("universities_directory").select("*").order("name") : Promise.resolve({ data: [] }),
    ]);

    data.careers = cp.data || [];
    data.jobs = jr.data || [];
    data.domains = dd.data || [];
    data.universities = ud.data || [];
    setAllData(data);
    setResults(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const s = query.toLowerCase().trim();
    if (!s) return allData;

    return {
      careers: allData.careers.filter(c =>
        c.title?.toLowerCase().includes(s) || c.domain?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s) || c.related_skills?.some((sk: string) => sk.toLowerCase().includes(s)) ||
        c.keywords?.some((k: string) => k.toLowerCase().includes(s))
      ),
      jobs: allData.jobs.filter(j =>
        j.title?.toLowerCase().includes(s) || j.domain?.toLowerCase().includes(s) ||
        j.description?.toLowerCase().includes(s) || j.skills_required?.some((sk: string) => sk.toLowerCase().includes(s)) ||
        j.career_path_keywords?.some((k: string) => k.toLowerCase().includes(s))
      ),
      domains: allData.domains.filter(d =>
        d.name?.toLowerCase().includes(s) || d.category?.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s) || d.keywords?.some((k: string) => k.toLowerCase().includes(s))
      ),
      universities: allData.universities.filter(u =>
        u.name?.toLowerCase().includes(s) || u.country?.toLowerCase().includes(s) ||
        u.city?.toLowerCase().includes(s) || u.continent?.toLowerCase().includes(s)
      ),
    };
  }, [query, allData]);

  const totalResults = filtered.careers.length + filtered.jobs.length + filtered.domains.length + filtered.universities.length;

  const tabConfig = [
    { key: "careers" as const, label: "Careers", icon: Briefcase, count: filtered.careers.length },
    { key: "jobs" as const, label: "Jobs", icon: Layers, count: filtered.jobs.length },
    { key: "domains" as const, label: "Domains", icon: Globe, count: filtered.domains.length },
    { key: "universities" as const, label: "Universities", icon: GraduationCap, count: filtered.universities.length },
  ].filter(t => mode === "all" || t.key === mode || (mode === "skills" && t.key === "jobs"));

  const visibleResults = (() => {
    if (mode === "skills") {
      // Extract unique skills from jobs
      const skillSet = new Set<string>();
      filtered.jobs.forEach(j => j.skills_required?.forEach((s: string) => skillSet.add(s)));
      return Array.from(skillSet).slice(0, maxResults).map(s => ({ type: "skill", title: s }));
    }
    const tab = activeTab === "all" ? "careers" : activeTab;
    const items = filtered[tab as keyof DirectoryResults] || [];
    return items.slice(0, maxResults);
  })();

  const defaultPlaceholder = {
    all: "Search careers, jobs, domains, universities...",
    careers: "Search career paths...",
    jobs: "Search job roles...",
    domains: "Search domains...",
    universities: "Search universities...",
    skills: "Search skills...",
  }[mode];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder || defaultPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 text-base bg-card border-border"
          autoFocus={autoFocus}
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Result count */}
      {query && (
        <p className="text-xs text-muted-foreground font-body">
          {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
        </p>
      )}

      {/* Tabs */}
      {showTabs && tabConfig.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {tabConfig.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <t.icon size={12} />
              {t.label}
              <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse font-body text-sm text-muted-foreground">Loading directory...</div>
        </div>
      ) : mode === "skills" ? (
        <SkillResults items={visibleResults} onSelect={onSelect} />
      ) : (
        <div className={inline ? "space-y-2" : "grid gap-3 md:grid-cols-2 lg:grid-cols-3"}>
          <AnimatePresence mode="popLayout">
            {visibleResults.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.015 }}
              >
                {activeTab === "careers" && <CareerCard item={item} onSelect={onSelect} />}
                {activeTab === "jobs" && <JobCard item={item} onSelect={onSelect} />}
                {activeTab === "domains" && <DomainCard item={item} onSelect={onSelect} />}
                {activeTab === "universities" && <UniversityCard item={item} onSelect={onSelect} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && visibleResults.length === 0 && (
        <div className="text-center py-10 bg-card rounded-xl border border-border">
          <Search className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="font-display text-foreground text-sm">No results found</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

/* ─── Card Components ─── */

const CareerCard = ({ item: c, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card
    className="hover:shadow-md transition-all cursor-pointer h-full border-border"
    onClick={() => onSelect?.(c, "career")}
  >
    <CardContent className="pt-4 pb-4 space-y-2">
      <div className="flex items-start gap-2.5">
        <span className="text-xl flex-shrink-0">{c.icon_emoji || "💼"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm text-foreground leading-tight">{c.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px]">{c.domain}</Badge>
            {c.difficulty && <Badge variant="outline" className="text-[10px]">{c.difficulty}</Badge>}
          </div>
        </div>
      </div>
      {c.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {c.salary_range && <span className="flex items-center gap-0.5"><DollarSign size={10} /> {c.salary_range}</span>}
        {c.demand_level && <span className="flex items-center gap-0.5"><TrendingUp size={10} /> {c.demand_level}</span>}
      </div>
      {c.related_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.related_skills.slice(0, 4).map((s: string) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const JobCard = ({ item: j, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card
    className="hover:shadow-md transition-all cursor-pointer h-full border-border"
    onClick={() => onSelect?.(j, "job")}
  >
    <CardContent className="pt-4 pb-4 space-y-2">
      <h3 className="font-display text-sm text-foreground">{j.title}</h3>
      <Badge variant="secondary" className="text-[10px]">{j.domain}</Badge>
      {j.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{j.description}</p>}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {j.avg_salary_usd && <span><DollarSign size={10} className="inline" /> {j.avg_salary_usd}</span>}
        {j.demand_level && <span><TrendingUp size={10} className="inline" /> {j.demand_level}</span>}
      </div>
      {j.skills_required?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {j.skills_required.slice(0, 3).map((s: string) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const DomainCard = ({ item: d, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card
    className="hover:shadow-md transition-all cursor-pointer h-full border-border"
    onClick={() => onSelect?.(d, "domain")}
  >
    <CardContent className="pt-4 pb-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{d.icon_emoji || "📁"}</span>
        <h3 className="font-display text-sm text-foreground">{d.name}</h3>
      </div>
      <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
      {d.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
      {d.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {d.keywords.slice(0, 4).map((k: string) => (
            <span key={k} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{k}</span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const UniversityCard = ({ item: u, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card
    className="hover:shadow-md transition-all cursor-pointer h-full border-border"
    onClick={() => onSelect?.(u, "university")}
  >
    <CardContent className="pt-4 pb-4 space-y-2">
      <h3 className="font-display text-sm text-foreground">{u.name}</h3>
      <p className="font-body text-xs text-muted-foreground">{u.city ? `${u.city}, ` : ""}{u.country}</p>
      <div className="flex items-center gap-1.5">
        {u.ranking_tier && <Badge variant="secondary" className="text-[10px]">{u.ranking_tier}</Badge>}
        <Badge variant="outline" className="text-[10px]">{u.type}</Badge>
        <Badge variant="outline" className="text-[10px]">{u.continent}</Badge>
      </div>
      {u.website && (
        <a
          href={u.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-body text-[10px] text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Visit website <ExternalLink size={10} />
        </a>
      )}
    </CardContent>
  </Card>
);

const SkillResults = ({ items, onSelect }: { items: any[]; onSelect?: (i: any, t: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <motion.button
        key={item.title}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground text-xs font-medium transition-all"
        onClick={() => onSelect?.(item, "skill")}
      >
        <Sparkles size={10} className="inline mr-1" />
        {item.title}
      </motion.button>
    ))}
  </div>
);

export default DirectorySearch;
