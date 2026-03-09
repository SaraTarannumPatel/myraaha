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
