import { DollarSign, TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const CareerCard = ({ item: c, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-border" onClick={() => onSelect?.(c, "career")}>
    <CardContent className="pt-4 pb-4 space-y-2">
      <div className="flex items-start gap-2.5">
        <span className="text-xl flex-shrink-0">{c.icon_emoji || "💼"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm text-foreground leading-tight">{c.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px]">
              {c.domain}
            </Badge>
            {c.difficulty && (
              <Badge variant="outline" className="text-[10px]">
                {c.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {c.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {c.salary_range && (
          <span className="flex items-center gap-0.5">
            <DollarSign size={10} /> {c.salary_range}
          </span>
        )}
        {c.demand_level && (
          <span className="flex items-center gap-0.5">
            <TrendingUp size={10} /> {c.demand_level}
          </span>
        )}
      </div>
      {c.related_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.related_skills.slice(0, 4).map((s: string) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">
              {s}
            </span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export const JobCard = ({ item: j, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-border" onClick={() => onSelect?.(j, "job")}>
    <CardContent className="pt-4 pb-4 space-y-2">
      <h3 className="font-display text-sm text-foreground">{j.title}</h3>
      <Badge variant="secondary" className="text-[10px]">
        {j.domain}
      </Badge>
      {j.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{j.description}</p>}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {j.avg_salary_usd && (
          <span>
            <DollarSign size={10} className="inline" /> {j.avg_salary_usd}
          </span>
        )}
        {j.demand_level && (
          <span>
            <TrendingUp size={10} className="inline" /> {j.demand_level}
          </span>
        )}
      </div>
      {j.skills_required?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {j.skills_required.slice(0, 3).map((s: string) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">
              {s}
            </span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export const DomainCard = ({ item: d, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-border" onClick={() => onSelect?.(d, "domain")}>
    <CardContent className="pt-4 pb-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{d.icon_emoji || "📁"}</span>
        <h3 className="font-display text-sm text-foreground">{d.name}</h3>
      </div>
      <Badge variant="outline" className="text-[10px]">
        {d.category}
      </Badge>
      {d.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
      {d.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {d.keywords.slice(0, 4).map((k: string) => (
            <span key={k} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">
              {k}
            </span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export const UniversityCard = ({ item: u, onSelect }: { item: any; onSelect?: (i: any, t: string) => void }) => (
  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-border" onClick={() => onSelect?.(u, "university")}>
    <CardContent className="pt-4 pb-4 space-y-2">
      <h3 className="font-display text-sm text-foreground">{u.name}</h3>
      <p className="font-body text-xs text-muted-foreground">
        {u.city ? `${u.city}, ` : ""}
        {u.country}
      </p>
      <div className="flex items-center gap-1.5">
        {u.ranking_tier && (
          <Badge variant="secondary" className="text-[10px]">
            {u.ranking_tier}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px]">
          {u.type}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {u.continent}
        </Badge>
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
