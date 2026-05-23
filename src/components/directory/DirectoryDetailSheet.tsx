import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ExternalLink, Briefcase, GraduationCap, Layers, Globe } from "lucide-react";

interface DirectoryDetailSheetProps {
  open: boolean;
  onClose: () => void;
  item: any;
  type: string;
}

const DirectoryDetailSheet = ({ open, onClose, item, type }: DirectoryDetailSheetProps) => {
  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-4 sm:px-6">
        <SheetHeader>
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            {type === "career" && <><span className="text-xl">{item.icon_emoji || "💼"}</span>{item.title}</>}
            {type === "job" && <><Layers size={18} className="text-primary" />{item.title}</>}
            {type === "domain" && <><span className="text-xl">{item.icon_emoji || "📁"}</span>{item.name}</>}
            {type === "university" && <><GraduationCap size={18} className="text-primary" />{item.name}</>}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Career Path Detail */}
          {type === "career" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{item.domain}</Badge>
                {item.difficulty && <Badge variant="outline">{item.difficulty}</Badge>}
                {item.demand_level && <Badge variant="outline">{item.demand_level}</Badge>}
              </div>
              {item.description && <p className="font-body text-sm text-muted-foreground">{item.description}</p>}
              {item.salary_range && (
                <InfoRow icon={<DollarSign size={14} />} label="Salary Range" value={item.salary_range} />
              )}
              {item.growth_trajectory && (
                <InfoRow icon={<TrendingUp size={14} />} label="Growth" value={item.growth_trajectory} />
              )}
              {item.day_to_day && <Section title="Day to Day" content={item.day_to_day} />}
              {item.industry_trends && <Section title="Industry Trends" content={item.industry_trends} />}
              <TagList title="Related Skills" items={item.related_skills} />
              <TagList title="Tools & Certifications" items={item.tools_certifications} />
              <TagList title="Keywords" items={item.keywords} />
            </>
          )}

          {/* Job Role Detail */}
          {type === "job" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{item.domain}</Badge>
                {item.experience_level && <Badge variant="outline">{item.experience_level}</Badge>}
                {item.demand_level && <Badge variant="outline">{item.demand_level}</Badge>}
              </div>
              {item.description && <p className="font-body text-sm text-muted-foreground">{item.description}</p>}
              {item.avg_salary_usd && (
                <InfoRow icon={<DollarSign size={14} />} label="Avg Salary" value={item.avg_salary_usd} />
              )}
              {item.work_environment && <Section title="Work Environment" content={item.work_environment} />}
              <TagList title="Skills Required" items={item.skills_required} />
              <TagList title="Career Path Keywords" items={item.career_path_keywords} />
            </>
          )}

          {/* Domain Detail */}
          {type === "domain" && (
            <>
              <Badge variant="outline">{item.category}</Badge>
              {item.description && <p className="font-body text-sm text-muted-foreground">{item.description}</p>}
              {item.parent_domain && <InfoRow icon={<Globe size={14} />} label="Parent Domain" value={item.parent_domain} />}
              <TagList title="Keywords" items={item.keywords} />
            </>
          )}

          {/* University Detail */}
          {type === "university" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {item.ranking_tier && <Badge variant="secondary">{item.ranking_tier}</Badge>}
                <Badge variant="outline">{item.type}</Badge>
                <Badge variant="outline">{item.continent}</Badge>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                {item.city ? `${item.city}, ` : ""}{item.country}
              </p>
              {item.website && (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-body text-sm text-primary hover:underline"
                >
                  Visit website <ExternalLink size={12} />
                </a>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-muted-foreground">{icon}</span>
    <span className="font-medium text-foreground">{label}:</span>
    <span className="text-muted-foreground">{value}</span>
  </div>
);

const Section = ({ title, content }: { title: string; content: string }) => (
  <div>
    <h4 className="font-display text-xs text-foreground mb-1">{title}</h4>
    <p className="font-body text-xs text-muted-foreground">{content}</p>
  </div>
);

const TagList = ({ title, items }: { title: string; items?: string[] }) => {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="font-display text-xs text-foreground mb-1.5">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{t}</span>
        ))}
      </div>
    </div>
  );
};

export default DirectoryDetailSheet;
