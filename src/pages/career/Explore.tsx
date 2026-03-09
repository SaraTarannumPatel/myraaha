import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, Search, GraduationCap, Briefcase, Globe, Layers, 
  Building2, ChevronRight, ExternalLink, Filter, TrendingUp, DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DirectoryTab = "careers" | "jobs" | "domains" | "universities";

const Explore = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<DirectoryTab>("careers");
  const [loading, setLoading] = useState(true);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [cp, jr, dd, ud] = await Promise.all([
      supabase.from("career_paths").select("*").order("title"),
      supabase.from("job_roles_directory").select("*").order("title"),
      supabase.from("domain_directory").select("*").order("name"),
      supabase.from("universities_directory").select("*").order("name"),
    ]);
    setCareerPaths(cp.data || []);
    setJobRoles(jr.data || []);
    setDomains(dd.data || []);
    setUniversities(ud.data || []);
    setLoading(false);
  };

  const s = search.toLowerCase();
  const filteredCareers = careerPaths.filter(c => 
    (!s || c.title?.toLowerCase().includes(s) || c.domain?.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s)) &&
    (!domainFilter || c.domain === domainFilter)
  );
  const filteredJobs = jobRoles.filter(j => 
    (!s || j.title?.toLowerCase().includes(s) || j.domain?.toLowerCase().includes(s) || j.description?.toLowerCase().includes(s)) &&
    (!domainFilter || j.domain === domainFilter)
  );
  const filteredDomains = domains.filter(d => 
    !s || d.name?.toLowerCase().includes(s) || d.category?.toLowerCase().includes(s) || d.description?.toLowerCase().includes(s)
  );
  const filteredUnis = universities.filter(u => 
    (!s || u.name?.toLowerCase().includes(s) || u.country?.toLowerCase().includes(s) || u.city?.toLowerCase().includes(s)) &&
    (!countryFilter || u.country === countryFilter)
  );

  const careerDomains = [...new Set(careerPaths.map(c => c.domain))].sort();
  const jobDomains = [...new Set(jobRoles.map(j => j.domain))].sort();
  const uniCountries = [...new Set(universities.map(u => u.country))].sort();

  const counts = {
    careers: filteredCareers.length,
    jobs: filteredJobs.length,
    domains: filteredDomains.length,
    universities: filteredUnis.length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Globe size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Explore Directory</h1>
            <p className="font-body text-sm text-muted-foreground">
              {careerPaths.length} career paths · {jobRoles.length} job roles · {domains.length} domains · {universities.length} universities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search careers, jobs, domains, universities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-base"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v as DirectoryTab); setDomainFilter(null); setCountryFilter(null); }}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="careers" className="text-xs sm:text-sm">
            <Briefcase size={14} className="mr-1 hidden sm:inline" /> Careers ({counts.careers})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs sm:text-sm">
            <Layers size={14} className="mr-1 hidden sm:inline" /> Jobs ({counts.jobs})
          </TabsTrigger>
          <TabsTrigger value="domains" className="text-xs sm:text-sm">
            <Sparkles size={14} className="mr-1 hidden sm:inline" /> Domains ({counts.domains})
          </TabsTrigger>
          <TabsTrigger value="universities" className="text-xs sm:text-sm">
            <GraduationCap size={14} className="mr-1 hidden sm:inline" /> Unis ({counts.universities})
          </TabsTrigger>
        </TabsList>

        {/* Career Paths */}
        <TabsContent value="careers" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant={domainFilter === null ? "default" : "outline"} size="sm" onClick={() => setDomainFilter(null)}>All</Button>
            {careerDomains.map(d => (
              <Button key={d} variant={domainFilter === d ? "default" : "outline"} size="sm" onClick={() => setDomainFilter(d)}>{d}</Button>
            ))}
          </div>
          {loading ? <LoadingState /> : filteredCareers.length === 0 ? <EmptyState /> : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredCareers.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className="hover:shadow-soft transition-all h-full">
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{c.icon_emoji || "💼"}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-base text-foreground">{c.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px]">{c.domain}</Badge>
                            {c.difficulty && <Badge variant="outline" className="text-[10px]">{c.difficulty}</Badge>}
                          </div>
                        </div>
                      </div>
                      {c.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                      <div className="flex items-center gap-4 text-xs">
                        {c.salary_range && <span className="flex items-center gap-1 text-muted-foreground"><DollarSign size={12} /> {c.salary_range}</span>}
                        {c.demand_level && <span className="flex items-center gap-1 text-muted-foreground"><TrendingUp size={12} /> {c.demand_level}</span>}
                      </div>
                      {c.related_skills && c.related_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.related_skills.slice(0, 4).map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Job Roles */}
        <TabsContent value="jobs" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap max-h-20 overflow-y-auto">
            <Button variant={domainFilter === null ? "default" : "outline"} size="sm" onClick={() => setDomainFilter(null)}>All</Button>
            {jobDomains.map(d => (
              <Button key={d} variant={domainFilter === d ? "default" : "outline"} size="sm" onClick={() => setDomainFilter(d)}>{d}</Button>
            ))}
          </div>
          {loading ? <LoadingState /> : filteredJobs.length === 0 ? <EmptyState /> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredJobs.map((j, i) => (
                <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}>
                  <Card className="hover:shadow-soft transition-all h-full">
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <h3 className="font-display text-sm text-foreground">{j.title}</h3>
                      <Badge variant="secondary" className="text-[10px]">{j.domain}</Badge>
                      {j.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{j.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {j.avg_salary_usd && <span><DollarSign size={10} className="inline" /> {j.avg_salary_usd}</span>}
                        {j.demand_level && <span><TrendingUp size={10} className="inline" /> {j.demand_level}</span>}
                      </div>
                      {j.skills_required && j.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {j.skills_required.slice(0, 3).map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Domains */}
        <TabsContent value="domains" className="space-y-4 mt-4">
          {loading ? <LoadingState /> : filteredDomains.length === 0 ? <EmptyState /> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDomains.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}>
                  <Card className="hover:shadow-soft transition-all h-full">
                    <CardContent className="pt-4 pb-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{d.icon_emoji || "📁"}</span>
                        <h3 className="font-display text-sm text-foreground">{d.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
                      {d.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
                      {d.keywords && d.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {d.keywords.slice(0, 4).map((k: string) => (
                            <span key={k} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{k}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Universities */}
        <TabsContent value="universities" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap max-h-20 overflow-y-auto">
            <Button variant={countryFilter === null ? "default" : "outline"} size="sm" onClick={() => setCountryFilter(null)}>All Countries</Button>
            {uniCountries.map(c => (
              <Button key={c} variant={countryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCountryFilter(c)}>{c}</Button>
            ))}
          </div>
          {loading ? <LoadingState /> : filteredUnis.length === 0 ? <EmptyState /> : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredUnis.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}>
                  <Card className="hover:shadow-soft transition-all h-full">
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-sm text-foreground">{u.name}</h3>
                          <p className="font-body text-xs text-muted-foreground">{u.city ? `${u.city}, ` : ''}{u.country}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {u.ranking_tier && <Badge variant="secondary" className="text-[10px]">{u.ranking_tier}</Badge>}
                          <Badge variant="outline" className="text-[10px]">{u.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{u.continent}</Badge>
                      </div>
                      {u.website && (
                        <a href={u.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-body text-[10px] text-primary hover:underline">
                          Visit website <ExternalLink size={10} />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="animate-pulse font-body text-muted-foreground">Loading directory...</div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 bg-card rounded-xl border border-border">
    <Search className="mx-auto text-muted-foreground mb-3" size={40} />
    <h3 className="font-display text-xl text-foreground mb-2">No results found</h3>
    <p className="font-body text-muted-foreground">Try a different search term or filter.</p>
  </div>
);

export default Explore;
