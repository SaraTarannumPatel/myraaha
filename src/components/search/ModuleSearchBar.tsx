import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, LayoutGrid, Table2, FileText, Filter, Sparkles, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export type SearchViewMode = "cards" | "table" | "detail";

export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  icon?: string;
  tags?: string[];
  data?: any;
}

export interface ModuleSearchBarProps {
  placeholder?: string;
  /** Which directory tables to pull suggestions from */
  sources?: ("careers" | "jobs" | "domains" | "universities" | "skills")[];
  /** Additional custom suggestions injected by the parent module */
  customSuggestions?: SearchSuggestion[];
  /** Filter chips shown below the search bar */
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  /** Fires on every keystroke */
  onSearch?: (query: string) => void;
  /** Fires when a suggestion is selected */
  onSelect?: (item: SearchSuggestion) => void;
  /** View mode toggle */
  showViewToggle?: boolean;
  viewMode?: SearchViewMode;
  onViewChange?: (mode: SearchViewMode) => void;
  /** Results count for display */
  resultCount?: number;
  className?: string;
  autoFocus?: boolean;
  /** Show AI-powered suggestions badge */
  showAiBadge?: boolean;
  /** Compact mode for sidebar usage */
  compact?: boolean;
}

const ModuleSearchBar = ({
  placeholder = "Search...",
  sources = [],
  customSuggestions = [],
  filterOptions = [],
  activeFilters = {},
  onFilterChange,
  onSearch,
  onSelect,
  showViewToggle = false,
  viewMode = "cards",
  onViewChange,
  resultCount,
  className = "",
  autoFocus = false,
  showAiBadge = false,
  compact = false,
}: ModuleSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [dirData, setDirData] = useState<Record<string, any[]>>({});
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch directory data on mount if sources specified
  useEffect(() => {
    if (sources.length === 0) return;
    const fetchSources = async () => {
      const fetches: Promise<any>[] = [];
      const keys: string[] = [];

      if (sources.includes("careers")) {
        keys.push("careers");
        fetches.push(supabase.from("career_paths").select("id,title,domain,description,icon_emoji,related_skills").order("title").limit(500).then());
      }
      if (sources.includes("jobs")) {
        keys.push("jobs");
        fetches.push(supabase.from("job_roles_directory").select("id,title,domain,description,skills_required").order("title").limit(500).then());
      }
      if (sources.includes("domains")) {
        keys.push("domains");
        fetches.push(supabase.from("domain_directory").select("id,name,category,description,icon_emoji,keywords").order("name").limit(500).then());
      }
      if (sources.includes("universities")) {
        keys.push("universities");
        fetches.push(supabase.from("universities_directory").select("id,name,country,city,continent").order("name").limit(500).then());
      }

      const results = await Promise.all(fetches);
      const data: Record<string, any[]> = {};
      results.forEach((r, i) => { data[keys[i]] = r.data || []; });
      setDirData(data);
    };
    fetchSources();
  }, [sources.join(",")]);

  // Build suggestions from directory data + custom
  const allSuggestions = useMemo(() => {
    const items: SearchSuggestion[] = [];

    (dirData.careers || []).forEach((c) =>
      items.push({ id: c.id, title: c.title, subtitle: c.domain, type: "career", icon: c.icon_emoji, tags: c.related_skills?.slice(0, 3), data: c })
    );
    (dirData.jobs || []).forEach((j) =>
      items.push({ id: j.id, title: j.title, subtitle: j.domain, type: "job", tags: j.skills_required?.slice(0, 3), data: j })
    );
    (dirData.domains || []).forEach((d) =>
      items.push({ id: d.id, title: d.name, subtitle: d.category, type: "domain", icon: d.icon_emoji, tags: d.keywords?.slice(0, 3), data: d })
    );
    (dirData.universities || []).forEach((u) =>
      items.push({ id: u.id, title: u.name, subtitle: `${u.city || ""}, ${u.country || ""}`.replace(/^, |, $/, ""), type: "university", data: u })
    );

    // Skills extracted from jobs
    if (sources.includes("skills")) {
      const skillSet = new Set<string>();
      (dirData.jobs || []).forEach((j) => j.skills_required?.forEach((s: string) => skillSet.add(s)));
      Array.from(skillSet).forEach((s) =>
        items.push({ id: `skill-${s}`, title: s, type: "skill" })
      );
    }

    return [...items, ...customSuggestions];
  }, [dirData, customSuggestions]);

  // Filter suggestions by query
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    const filtered = allSuggestions
      .filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle?.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
    setSuggestions(filtered);
  }, [query, allSuggestions]);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    onSearch?.(val);
  }, [onSearch]);

  const handleSelect = useCallback((item: SearchSuggestion) => {
    onSelect?.(item);
    setQuery(item.title);
    setFocused(false);
  }, [onSelect]);

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeColors: Record<string, string> = {
    career: "bg-primary/10 text-primary",
    job: "bg-accent/20 text-accent-foreground",
    domain: "bg-secondary/50 text-secondary-foreground",
    university: "bg-muted text-muted-foreground",
    skill: "bg-primary/20 text-primary",
  };

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      {/* Search input row */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={compact ? 14 : 16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            className={`${compact ? "pl-8 pr-8 h-9 text-sm" : "pl-9 pr-9 text-base"} bg-card border-border transition-shadow focus:shadow-md`}
            autoFocus={autoFocus}
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
              type="button"
            >
              <X size={compact ? 12 : 14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        {filterOptions.length > 0 && (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className="gap-1.5 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} />
            {!compact && "Filters"}
            {Object.values(activeFilters).filter((v) => v !== "all").length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {Object.values(activeFilters).filter((v) => v !== "all").length}
              </Badge>
            )}
          </Button>
        )}

        {/* View toggle */}
        {showViewToggle && (
          <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5 shrink-0">
            {([
              { mode: "cards" as const, icon: LayoutGrid, label: "Cards" },
              { mode: "table" as const, icon: Table2, label: "Table" },
              { mode: "detail" as const, icon: FileText, label: "Detail" },
            ] as const).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewChange?.(mode)}
                aria-pressed={viewMode === mode}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                  viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={12} />
                {!compact && label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI badge + result count */}
      {(showAiBadge || resultCount !== undefined) && (
        <div className="flex items-center justify-between">
          {showAiBadge && (
            <Badge variant="outline" className="gap-1 text-[10px] font-normal border-primary/30 text-primary">
              <Sparkles size={10} /> AI-powered suggestions
            </Badge>
          )}
          {resultCount !== undefined && query && (
            <p className="text-xs text-muted-foreground font-body ml-auto">
              {resultCount} result{resultCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Filter chips */}
      <AnimatePresence>
        {showFilters && filterOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 py-2">
              {filterOptions.map((filter) => (
                <div key={filter.key} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{filter.label}</span>
                  <div className="flex gap-1 flex-wrap">
                    {filter.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onFilterChange?.(filter.key, opt.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          (activeFilters[filter.key] || "all") === opt.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            style={{ maxWidth: "calc(100% - 1rem)" }}
          >
            <div className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left"
                >
                  {s.icon && <span className="text-lg">{s.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                    {s.subtitle && <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>}
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${typeColors[s.type] || ""}`}>
                    {s.type}
                  </Badge>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleSearchBar;
