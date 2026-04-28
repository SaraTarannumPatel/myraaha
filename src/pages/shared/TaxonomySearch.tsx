import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Building2, Wrench, BookOpen, Globe, GraduationCap, Briefcase, Compass, Layers } from "lucide-react";

type TableKey =
  | "industry_directory"
  | "skills_directory"
  | "subjects_directory"
  | "domain_directory"
  | "sector_directory"
  | "universities_directory"
  | "job_roles_directory"
  | "online_courses_directory"
  | "countries_directory";

interface Hit {
  id: string;
  table: TableKey;
  label: string;
  description?: string | null;
  category?: string | null;
  keywords?: string[] | null;
}

const TABLES: { key: TableKey; label: string; icon: any; field: "name" | "title"; }[] = [
  { key: "industry_directory", label: "Industries", icon: Building2, field: "name" },
  { key: "skills_directory", label: "Skills", icon: Wrench, field: "name" },
  { key: "subjects_directory", label: "Subjects", icon: BookOpen, field: "name" },
  { key: "domain_directory", label: "Domains", icon: Layers, field: "name" },
  { key: "sector_directory", label: "Sectors", icon: Compass, field: "name" },
  { key: "universities_directory", label: "Universities", icon: GraduationCap, field: "name" },
  { key: "job_roles_directory", label: "Job Roles", icon: Briefcase, field: "title" },
  { key: "online_courses_directory", label: "Courses", icon: BookOpen, field: "name" },
  { key: "countries_directory", label: "Countries", icon: Globe, field: "name" },
];

const TaxonomySearch = () => {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<TableKey | "all">("all");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);

  const tables = useMemo(() => (active === "all" ? TABLES : TABLES.filter((t) => t.key === active)), [active]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const run = async () => {
      const results: Hit[] = [];
      const pattern = `%${term}%`;
      await Promise.all(
        tables.map(async (t) => {
          const { data } = await (supabase as any)
            .from(t.key)
            .select(`id, ${t.field}, description, ${t.key === "skills_directory" || t.key === "domain_directory" ? "category," : ""} keywords`)
            .or(`${t.field}.ilike.${pattern},description.ilike.${pattern}`)
            .limit(15);
          (data || []).forEach((row: any) =>
            results.push({
              id: row.id,
              table: t.key,
              label: row[t.field],
              description: row.description,
              category: row.category,
              keywords: row.keywords,
            }),
          );
        }),
      );
      if (!cancelled) {
        setHits(results);
        setLoading(false);
      }
    };
    const id = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q, tables]);

  const grouped = useMemo(() => {
    const m: Record<string, Hit[]> = {};
    for (const h of hits) (m[h.table] ||= []).push(h);
    return m;
  }, [hits]);

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-4xl text-foreground">Browse the taxonomy</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Search industries, skills, subjects, domains, sectors, universities, roles, courses &amp; countries.
        </p>
      </motion.div>

      <div className="mt-5 sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search e.g. 'climate', 'python', 'IIT', 'cybersecurity'…"
            className="pl-9 h-11 text-base"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 mt-2 -mx-1 px-1">
          <Button size="sm" variant={active === "all" ? "default" : "outline"} onClick={() => setActive("all")} className="shrink-0">
            All
          </Button>
          {TABLES.map((t) => {
            const Icon = t.icon;
            return (
              <Button
                key={t.key}
                size="sm"
                variant={active === t.key ? "default" : "outline"}
                onClick={() => setActive(t.key)}
                className="shrink-0"
              >
                <Icon size={12} className="mr-1.5" /> {t.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto animate-spin text-primary" />
          </div>
        )}

        {!loading && q.trim().length < 2 && (
          <p className="text-center text-sm text-muted-foreground py-12">Type at least 2 characters to search.</p>
        )}

        {!loading && q.trim().length >= 2 && hits.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No matches. Try a different word.</p>
        )}

        <div className="space-y-5">
          {TABLES.filter((t) => grouped[t.key]?.length).map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.key}>
                <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <Icon size={14} /> {t.label} <span className="text-xs">({grouped[t.key].length})</span>
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {grouped[t.key].map((h) => (
                    <Card key={`${t.key}-${h.id}`} className="hover:border-primary/40 transition">
                      <CardContent className="p-3">
                        <p className="font-display text-sm text-foreground">{h.label}</p>
                        {h.description && (
                          <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-0.5">{h.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {h.category && <Badge variant="secondary" className="text-[10px]">{h.category}</Badge>}
                          {(h.keywords || []).slice(0, 4).map((k) => (
                            <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaxonomySearch;
