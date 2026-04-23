import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Search, X, Briefcase, Layers, GraduationCap, Zap, BookOpen, Building2, Factory, MapPin, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ExploreDetailDialog from "@/components/directory/ExploreDetailDialog";

type FilterTab = "careers" | "jobs" | "domains" | "universities" | "industries" | "sectors" | "skills" | "subjects" | "courses" | "countries";

const TAB_CONFIG: { key: FilterTab; label: string; icon: any; emoji: string }[] = [
  { key: "industries", label: "Industries", icon: Factory, emoji: "🏭" },
  { key: "sectors", label: "Sectors", icon: Building2, emoji: "📊" },
  { key: "domains", label: "Domains", icon: Globe, emoji: "🌐" },
  { key: "careers", label: "Careers", icon: Briefcase, emoji: "💼" },
  { key: "jobs", label: "Job Roles", icon: Layers, emoji: "👔" },
  { key: "skills", label: "Skills", icon: Zap, emoji: "🎯" },
  { key: "subjects", label: "Subjects", icon: BookOpen, emoji: "📚" },
  { key: "universities", label: "Universities", icon: GraduationCap, emoji: "🎓" },
  { key: "courses", label: "Online Courses", icon: Monitor, emoji: "💻" },
  { key: "countries", label: "Countries", icon: MapPin, emoji: "🌍" },
];

const TABLE_MAP: Record<FilterTab, string> = {
  careers: "career_paths",
  jobs: "job_roles_directory",
  domains: "domain_directory",
  universities: "universities_directory",
  industries: "industry_directory",
  sectors: "sector_directory",
  skills: "skills_directory",
  subjects: "subjects_directory",
  courses: "online_courses_directory",
  countries: "countries_directory",
};

const TYPE_MAP: Record<FilterTab, string> = {
  careers: "career", jobs: "job", domains: "domain", universities: "university",
  industries: "industry", sectors: "sector", skills: "skill", subjects: "subject",
  courses: "course", countries: "country",
};

const PAGE_SIZE = 30;

const Explore = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("careers");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("");
  const [allData, setAllData] = useState<Record<FilterTab, any[]>>({
    careers: [], jobs: [], domains: [], universities: [],
    industries: [], sectors: [], skills: [], subjects: [],
    courses: [], countries: [],
  });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Multi-select filter state — 8 facets w/ AND logic
  const [filterIndustries, setFilterIndustries] = useState<string[]>([]);
  const [filterSectors, setFilterSectors] = useState<string[]>([]);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);
  const [filterCareers, setFilterCareers] = useState<string[]>([]);
  const [filterJobs, setFilterJobs] = useState<string[]>([]);
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterSubjects, setFilterSubjects] = useState<string[]>([]);
  const [filterUnis, setFilterUnis] = useState<string[]>([]);
  const [filterCourses, setFilterCourses] = useState<string[]>([]);
  const [filterCountries, setFilterCountries] = useState<string[]>([]);
  const clearAllFilters = () => {
    setFilterIndustries([]); setFilterSectors([]); setFilterDomains([]); setFilterCareers([]);
    setFilterJobs([]); setFilterSkills([]); setFilterSubjects([]); setFilterUnis([]);
    setFilterCourses([]); setFilterCountries([]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const results = await Promise.all(
      TAB_CONFIG.map(t => {
        const orderCol = ["universities", "domains", "industries", "sectors", "skills", "subjects", "courses", "countries"].includes(t.key) ? "name" : "title";
        return supabase.from(TABLE_MAP[t.key] as any).select("*").order(orderCol).limit(1000);
      })
    );
    const newData: Record<string, any[]> = {};
    TAB_CONFIG.forEach((t, i) => { newData[t.key] = results[i].data || []; });
    setAllData(newData as any);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const s = query.toLowerCase().trim();
    let items = allData[activeTab] || [];

    const matchesAny = (item: any, keys: string[], filters: string[]) => {
      if (filters.length === 0) return true;
      return filters.some(f =>
        keys.some(k => {
          const v = item[k];
          if (!v) return false;
          if (Array.isArray(v)) return v.includes(f);
          return v === f;
        })
      );
    };

    items = items.filter((item: any) =>
      matchesAny(item, ["industry", "industry_name", "name", "related_industries", "top_industries"], filterIndustries) &&
      matchesAny(item, ["sector", "name", "related_sectors", "top_sectors"], filterSectors) &&
      matchesAny(item, ["domain", "name", "related_domains", "top_domains"], filterDomains) &&
      matchesAny(item, ["title", "name", "related_careers", "top_careers"], filterCareers) &&
      matchesAny(item, ["title", "name", "related_job_roles", "top_job_roles", "job_role_keywords"], filterJobs) &&
      matchesAny(item, ["name", "related_skills", "skills_required", "top_skills", "soft_skills"], filterSkills) &&
      matchesAny(item, ["name", "related_subjects", "top_subjects"], filterSubjects) &&
      matchesAny(item, ["name", "related_universities", "top_universities"], filterUnis) &&
      matchesAny(item, ["name", "title", "related_courses", "top_courses"], filterCourses) &&
      matchesAny(item, ["name", "country", "countries_in_demand", "related_countries", "top_countries"], filterCountries)
    );

    if (!s) return items;

    return items.filter((item: any) => {
      const fields = [item.title, item.name, item.domain, item.category, item.description, item.industry, item.sector, item.platform, item.continent, item.country, item.city].filter(Boolean);
      const arrays = [item.keywords, item.related_skills, item.skills_required, item.related_domains, item.related_job_roles, item.related_subjects, item.related_universities, item.related_careers, item.related_sectors, item.related_industries, item.top_industries, item.top_careers].filter(Boolean);
      return fields.some(f => f.toLowerCase().includes(s)) || arrays.some(arr => arr.some((v: string) => v.toLowerCase().includes(s)));
    });
  }, [query, allData, activeTab, filterIndustries, filterSectors, filterDomains, filterCareers, filterJobs, filterSkills, filterSubjects, filterUnis, filterCourses, filterCountries]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTab, query, filterIndustries, filterSectors, filterDomains, filterCareers, filterJobs, filterSkills, filterSubjects, filterUnis, filterCourses, filterCountries]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore) return;
    const el = scrollRef.current;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  const handleSelect = (item: any, type: string) => { setSelectedItem(item); setSelectedType(type); };

  const handleNavigateFromDetail = (targetType: string, name: string) => {
    const tabMap: Record<string, FilterTab> = {
      careers: "careers", jobs: "jobs", domains: "domains", universities: "universities",
      industries: "industries", sectors: "sectors", skills: "skills", subjects: "subjects",
      courses: "courses", countries: "countries",
    };
    const tab = tabMap[targetType];
    if (tab) { setActiveTab(tab); setQuery(name); clearAllFilters(); }
  };

  const dedupSort = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort();
  const collect = (rows: any[], keys: string[]) => {
    const out: string[] = [];
    rows.forEach(r => keys.forEach(k => {
      const v = r[k];
      if (Array.isArray(v)) v.forEach(x => x && out.push(x));
      else if (v) out.push(v);
    }));
    return out;
  };

  const uniqueIndustries = useMemo(() => dedupSort(collect([...allData.industries, ...allData.careers, ...allData.jobs, ...allData.domains], ["name", "industry"])), [allData]);
  const uniqueSectors = useMemo(() => dedupSort(collect([...allData.sectors, ...allData.careers, ...allData.jobs, ...allData.domains], ["name", "sector"])), [allData]);
  const uniqueDomains = useMemo(() => dedupSort(collect([...allData.domains, ...allData.careers], ["name", "domain"])), [allData]);
  const uniqueCareers = useMemo(() => dedupSort(allData.careers.map(c => c.title)), [allData]);
  const uniqueJobs = useMemo(() => dedupSort(allData.jobs.map(j => j.title)), [allData]);
  const uniqueSkills = useMemo(() => dedupSort(allData.skills.map(s => s.name)), [allData]);
  const uniqueSubjects = useMemo(() => dedupSort(allData.subjects.map(s => s.name)), [allData]);
  const uniqueUnis = useMemo(() => dedupSort(allData.universities.map(u => u.name)), [allData]);
  const uniqueCourses = useMemo(() => dedupSort(collect(allData.courses, ["title", "name"])), [allData]);
  const uniqueCountries = useMemo(() => dedupSort(allData.countries.map(c => c.name)), [allData]);

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {} as any;
    TAB_CONFIG.forEach(t => { counts[t.key] = allData[t.key]?.length || 0; });
    return counts;
  }, [allData]);

  const toggleFilter = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const totalActiveFilters =
    filterIndustries.length + filterSectors.length + filterDomains.length + filterCareers.length +
    filterJobs.length + filterSkills.length + filterSubjects.length + filterUnis.length +
    filterCourses.length + filterCountries.length;

  return (
    <div className="space-y-4 px-1 sm:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Globe size={18} className="text-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl md:text-2xl text-primary truncate">Explore Directory</h1>
            <p className="font-body text-[11px] sm:text-xs text-muted-foreground line-clamp-2">
              Careers, jobs, industries, sectors, domains, skills, subjects, universities, courses & countries
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search across all directories..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 pr-9 text-sm bg-card border-border" />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TAB_CONFIG.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); clearAllFilters(); }}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
              activeTab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <t.icon size={11} />
            {t.label}
            <span className="opacity-70">({tabCounts[t.key]})</span>
          </button>
        ))}
      </div>

      {/* 8 Facet Filter Dropdowns - always visible */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {[
            { label: "Industry", emoji: "🏭", list: uniqueIndustries, sel: filterIndustries, setter: setFilterIndustries },
            { label: "Sector", emoji: "📊", list: uniqueSectors, sel: filterSectors, setter: setFilterSectors },
            { label: "Domain", emoji: "🌐", list: uniqueDomains, sel: filterDomains, setter: setFilterDomains },
            { label: "Career", emoji: "💼", list: uniqueCareers, sel: filterCareers, setter: setFilterCareers },
            { label: "Job Role", emoji: "👔", list: uniqueJobs, sel: filterJobs, setter: setFilterJobs },
            { label: "Skill", emoji: "🎯", list: uniqueSkills, sel: filterSkills, setter: setFilterSkills },
            { label: "Subject", emoji: "📚", list: uniqueSubjects, sel: filterSubjects, setter: setFilterSubjects },
            { label: "University", emoji: "🎓", list: uniqueUnis, sel: filterUnis, setter: setFilterUnis },
            { label: "Course", emoji: "💻", list: uniqueCourses, sel: filterCourses, setter: setFilterCourses },
            { label: "Country", emoji: "🌍", list: uniqueCountries, sel: filterCountries, setter: setFilterCountries },
          ].map((f) => (
            <select
              key={f.label}
              value=""
              onChange={(e) => e.target.value && toggleFilter(f.sel, e.target.value, f.setter)}
              className="text-[11px] px-2 py-1.5 rounded-lg border border-border bg-card font-body text-foreground truncate"
              title={`Filter by ${f.label}`}
            >
              <option value="">{f.emoji} + {f.label}</option>
              {f.list.filter(x => !f.sel.includes(x)).slice(0, 200).map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          ))}
        </div>
        {totalActiveFilters > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { emoji: "🏭", sel: filterIndustries, setter: setFilterIndustries },
              { emoji: "📊", sel: filterSectors, setter: setFilterSectors },
              { emoji: "🌐", sel: filterDomains, setter: setFilterDomains },
              { emoji: "💼", sel: filterCareers, setter: setFilterCareers },
              { emoji: "👔", sel: filterJobs, setter: setFilterJobs },
              { emoji: "🎯", sel: filterSkills, setter: setFilterSkills },
              { emoji: "📚", sel: filterSubjects, setter: setFilterSubjects },
              { emoji: "🎓", sel: filterUnis, setter: setFilterUnis },
              { emoji: "💻", sel: filterCourses, setter: setFilterCourses },
              { emoji: "🌍", sel: filterCountries, setter: setFilterCountries },
            ].flatMap((f) =>
              f.sel.map((v) => (
                <Badge key={`${f.emoji}-${v}`} variant="secondary" className="text-[10px] cursor-pointer gap-1" onClick={() => toggleFilter(f.sel, v, f.setter)}>
                  {f.emoji} {v} <X size={10} />
                </Badge>
              ))
            )}
            <button
              onClick={clearAllFilters}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              Clear all ({totalActiveFilters})
            </button>
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground font-body">
        Showing {visibleItems.length} of {filtered.length} results{query && ` for "${query}"`}
      </p>

      {/* Cards grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse font-body text-sm text-muted-foreground">Loading directory...</div>
        </div>
      ) : (
        <div ref={scrollRef} onScroll={handleScroll} className="max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item: any, i: number) => (
                <motion.div key={item.id || `${activeTab}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(i * 0.01, 0.3) }}>
                  <ExploreCard item={item} type={activeTab} onSelect={handleSelect} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {hasMore && <div className="text-center py-4"><p className="font-body text-xs text-muted-foreground animate-pulse">Scroll for more...</p></div>}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 bg-card rounded-xl border border-border">
              <Search className="mx-auto text-muted-foreground mb-2" size={32} />
              <p className="font-display text-foreground text-sm">No results found</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Try different keywords or filters</p>
            </div>
          )}
        </div>
      )}

      <ExploreDetailDialog open={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} type={selectedType} onNavigate={handleNavigateFromDetail} />
    </div>
  );
};

const ExploreCard = ({ item, type, onSelect }: { item: any; type: FilterTab; onSelect: (item: any, type: string) => void }) => {
  const title = item.title || item.name;
  const description = item.description || "";
  const emoji = item.icon_emoji || { careers: "💼", jobs: "👔", domains: "🌐", universities: "🎓", industries: "🏭", sectors: "📊", skills: "🎯", subjects: "📚", courses: "💻", countries: "🌍" }[type] || "📄";

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer h-full border-border" onClick={() => onSelect(item, TYPE_MAP[type])}>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm text-foreground leading-tight line-clamp-2">{title}</h3>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {item.domain && <Badge variant="secondary" className="text-[10px]">{item.domain}</Badge>}
              {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
              {item.industry && type !== "industries" && <Badge variant="secondary" className="text-[10px]">🏭 {item.industry}</Badge>}
              {item.sector && type !== "sectors" && <Badge variant="outline" className="text-[10px]">📊 {item.sector}</Badge>}
              {item.platform && <Badge variant="secondary" className="text-[10px]">{item.platform}</Badge>}
              {item.continent && <Badge variant="outline" className="text-[10px]">{item.continent}</Badge>}
              {item.difficulty && <Badge variant="outline" className="text-[10px]">{item.difficulty}</Badge>}
              {item.ranking_tier && <Badge variant="secondary" className="text-[10px]">{item.ranking_tier}</Badge>}
              {item.demand_level && <Badge variant="outline" className="text-[10px]">📈 {item.demand_level}</Badge>}
            </div>
          </div>
        </div>
        {description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{description}</p>}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {item.salary_range && <span>💰 {item.salary_range}</span>}
          {item.avg_salary_usd && <span>💰 {item.avg_salary_usd}</span>}
          {item.price_range && <span>💰 {item.price_range}</span>}
          {item.growth_trajectory && <span>📈 {item.growth_trajectory}</span>}
        </div>
        {(item.related_skills || item.skills_required || item.keywords || item.top_skills)?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(item.related_skills || item.skills_required || item.keywords || item.top_skills || []).slice(0, 4).map((s: string) => (
              <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Explore;
