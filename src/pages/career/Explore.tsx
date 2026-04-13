import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Search, X, Briefcase, Layers, GraduationCap, Zap, BookOpen, Building2, Factory, LayoutGrid, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ExploreDetailDialog from "@/components/directory/ExploreDetailDialog";

type FilterTab = "careers" | "jobs" | "domains" | "universities" | "industries" | "sectors" | "skills" | "subjects";

const TAB_CONFIG: { key: FilterTab; label: string; icon: any; emoji: string }[] = [
  { key: "careers", label: "Careers", icon: Briefcase, emoji: "💼" },
  { key: "jobs", label: "Jobs", icon: Layers, emoji: "👔" },
  { key: "domains", label: "Domains", icon: Globe, emoji: "🌐" },
  { key: "universities", label: "Universities", icon: GraduationCap, emoji: "🎓" },
  { key: "industries", label: "Industries", icon: Factory, emoji: "🏭" },
  { key: "sectors", label: "Sectors", icon: Building2, emoji: "📊" },
  { key: "skills", label: "Skills", icon: Zap, emoji: "🎯" },
  { key: "subjects", label: "Subjects", icon: BookOpen, emoji: "📚" },
];

const PAGE_SIZE = 30;

const Explore = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("careers");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("");
  const [allData, setAllData] = useState<Record<FilterTab, any[]>>({
    careers: [], jobs: [], domains: [], universities: [],
    industries: [], sectors: [], skills: [], subjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Industry/Sector filter state
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [filterSector, setFilterSector] = useState<string>("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const [careers, jobs, domains, universities, industries, sectors, skills, subjects] = await Promise.all([
      supabase.from("career_paths").select("*").order("title"),
      supabase.from("job_roles_directory").select("*").order("title"),
      supabase.from("domain_directory").select("*").order("name"),
      supabase.from("universities_directory").select("*").order("name"),
      supabase.from("industry_directory").select("*").order("name"),
      supabase.from("sector_directory").select("*").order("name"),
      supabase.from("skills_directory").select("*").order("name"),
      supabase.from("subjects_directory").select("*").order("name"),
    ]);
    setAllData({
      careers: careers.data || [],
      jobs: jobs.data || [],
      domains: domains.data || [],
      universities: universities.data || [],
      industries: industries.data || [],
      sectors: sectors.data || [],
      skills: skills.data || [],
      subjects: subjects.data || [],
    });
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const s = query.toLowerCase().trim();
    let items = allData[activeTab] || [];

    // Apply industry/sector filters
    if (filterIndustry) {
      items = items.filter((item: any) => 
        item.industry === filterIndustry || 
        item.industry_name === filterIndustry ||
        item.name === filterIndustry
      );
    }
    if (filterSector) {
      items = items.filter((item: any) =>
        item.sector === filterSector ||
        item.name === filterSector
      );
    }

    if (!s) return items;

    return items.filter((item: any) => {
      const searchFields = [
        item.title, item.name, item.domain, item.category, item.description,
        item.industry, item.sector, item.industry_name, item.country, item.city, item.continent,
      ].filter(Boolean);
      const arrayFields = [
        item.keywords, item.related_skills, item.skills_required, item.related_domains,
        item.related_job_roles, item.related_subjects, item.related_universities,
        item.related_careers, item.related_sectors,
      ].filter(Boolean);

      return searchFields.some(f => f.toLowerCase().includes(s)) ||
        arrayFields.some(arr => arr.some((v: string) => v.toLowerCase().includes(s)));
    });
  }, [query, allData, activeTab, filterIndustry, filterSector]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, query, filterIndustry, filterSector]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore) return;
    const el = scrollRef.current;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  const handleSelect = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  const handleNavigateFromDetail = (targetType: string, name: string) => {
    // Map detail type to tab key
    const tabMap: Record<string, FilterTab> = {
      careers: "careers", jobs: "jobs", domains: "domains", universities: "universities",
      industries: "industries", sectors: "sectors", skills: "skills", subjects: "subjects",
    };
    const tab = tabMap[targetType];
    if (tab) {
      setActiveTab(tab);
      setQuery(name);
      setFilterIndustry("");
      setFilterSector("");
    }
  };

  // Unique industries/sectors for filter dropdowns
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    allData.industries.forEach(i => set.add(i.name));
    allData.careers.forEach(c => c.industry && set.add(c.industry));
    allData.jobs.forEach(j => j.industry && set.add(j.industry));
    allData.domains.forEach(d => d.industry && set.add(d.industry));
    return Array.from(set).sort();
  }, [allData]);

  const uniqueSectors = useMemo(() => {
    const set = new Set<string>();
    allData.sectors.forEach(s => set.add(s.name));
    allData.careers.forEach(c => c.sector && set.add(c.sector));
    allData.jobs.forEach(j => j.sector && set.add(j.sector));
    allData.domains.forEach(d => d.sector && set.add(d.sector));
    return Array.from(set).sort();
  }, [allData]);

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {} as any;
    for (const tab of TAB_CONFIG) {
      counts[tab.key] = allData[tab.key]?.length || 0;
    }
    return counts;
  }, [allData]);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Globe size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground">Explore Directory</h1>
            <p className="font-body text-sm text-muted-foreground">
              Search careers, jobs, domains, universities, industries, sectors, skills & subjects
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search across all directories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 text-base bg-card border-border"
        />
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
            onClick={() => { setActiveTab(t.key); setFilterIndustry(""); setFilterSector(""); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <t.icon size={12} />
            {t.label}
            <span className="opacity-70">({tabCounts[t.key]})</span>
          </button>
        ))}
      </div>

      {/* Industry & Sector Filters */}
      {(activeTab === "careers" || activeTab === "jobs" || activeTab === "domains") && (
        <div className="flex flex-wrap gap-2">
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card font-body text-foreground"
          >
            <option value="">All Industries</option>
            {uniqueIndustries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card font-body text-foreground"
          >
            <option value="">All Sectors</option>
            {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-muted-foreground font-body">
        Showing {visibleItems.length} of {filtered.length} results
        {query && ` for "${query}"`}
      </p>

      {/* Cards grid with scroll loading */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse font-body text-sm text-muted-foreground">Loading directory...</div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1"
        >
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item: any, i: number) => (
                <motion.div
                  key={item.id || `${activeTab}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                >
                  <ExploreCard item={item} type={activeTab} onSelect={handleSelect} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {hasMore && (
            <div className="text-center py-4">
              <p className="font-body text-xs text-muted-foreground animate-pulse">Scroll for more...</p>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 bg-card rounded-xl border border-border">
              <Search className="mx-auto text-muted-foreground mb-2" size={32} />
              <p className="font-display text-foreground text-sm">No results found</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Try different keywords or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Center popup detail view */}
      <ExploreDetailDialog
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        type={selectedType}
        onNavigate={handleNavigateFromDetail}
      />
    </div>
  );
};

// Universal card component for all types
const ExploreCard = ({ item, type, onSelect }: { item: any; type: FilterTab; onSelect: (item: any, type: string) => void }) => {
  const typeMap: Record<FilterTab, string> = {
    careers: "career", jobs: "job", domains: "domain", universities: "university",
    industries: "industry", sectors: "sector", skills: "skill", subjects: "subject",
  };

  const title = item.title || item.name;
  const description = item.description || item.task_description || "";
  const emoji = item.icon_emoji || {
    careers: "💼", jobs: "👔", domains: "🌐", universities: "🎓",
    industries: "🏭", sectors: "📊", skills: "🎯", subjects: "📚",
  }[type] || "📄";

  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer h-full border-border"
      onClick={() => onSelect(item, typeMap[type])}
    >
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm text-foreground leading-tight line-clamp-2">{title}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {item.domain && <Badge variant="secondary" className="text-[10px]">{item.domain}</Badge>}
              {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
              {item.industry && <Badge variant="secondary" className="text-[10px]">🏭 {item.industry}</Badge>}
              {item.sector && <Badge variant="outline" className="text-[10px]">📊 {item.sector}</Badge>}
              {item.industry_name && <Badge variant="secondary" className="text-[10px]">🏭 {item.industry_name}</Badge>}
              {item.difficulty && <Badge variant="outline" className="text-[10px]">{item.difficulty}</Badge>}
              {item.ranking_tier && <Badge variant="secondary" className="text-[10px]">{item.ranking_tier}</Badge>}
              {item.continent && <Badge variant="outline" className="text-[10px]">{item.continent}</Badge>}
              {item.country && <Badge variant="outline" className="text-[10px]">{item.country}</Badge>}
            </div>
          </div>
        </div>
        {description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{description}</p>}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {item.salary_range && <span>💰 {item.salary_range}</span>}
          {item.avg_salary_usd && <span>💰 {item.avg_salary_usd}</span>}
          {item.demand_level && <span>📈 {item.demand_level}</span>}
        </div>
        {/* Show related tags preview */}
        {(item.related_skills || item.skills_required || item.keywords)?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(item.related_skills || item.skills_required || item.keywords || []).slice(0, 4).map((s: string) => (
              <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Explore;
