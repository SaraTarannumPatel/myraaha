import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, ExternalLink, ArrowRight } from "lucide-react";

interface ExploreDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any;
  type: string;
  onNavigate?: (type: string, name: string) => void;
}

const ExploreDetailDialog = ({ open, onClose, item, type, onNavigate }: ExploreDetailDialogProps) => {
  if (!item) return null;

  const handleTagClick = (targetType: string, name: string) => {
    onNavigate?.(targetType, name);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                {(type === "career" || type === "domain" || type === "industry" || type === "sector") && (
                  <span className="text-2xl">{item.icon_emoji || "📁"}</span>
                )}
                {item.title || item.name}
              </DialogTitle>
            </DialogHeader>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {item.domain && <Badge variant="secondary">{item.domain}</Badge>}
              {item.category && <Badge variant="outline">{item.category}</Badge>}
              {item.difficulty && <Badge variant="outline">{item.difficulty}</Badge>}
              {item.demand_level && <Badge variant="outline">{item.demand_level}</Badge>}
              {item.experience_level && <Badge variant="outline">{item.experience_level}</Badge>}
              {item.industry && (
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleTagClick("industries", item.industry)}>
                  🏭 {item.industry}
                </Badge>
              )}
              {item.sector && (
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleTagClick("sectors", item.sector)}>
                  📊 {item.sector}
                </Badge>
              )}
              {item.ranking_tier && <Badge variant="secondary">{item.ranking_tier}</Badge>}
              {item.type && type === "university" && <Badge variant="outline">{item.type}</Badge>}
              {item.continent && <Badge variant="outline">{item.continent}</Badge>}
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Description</h4>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Career-specific fields */}
            {type === "career" && (
              <>
                {item.salary_range && <InfoRow label="Salary Range" value={item.salary_range} icon="💰" />}
                {item.growth_trajectory && <InfoRow label="Growth Trajectory" value={item.growth_trajectory} icon="📈" />}
                {item.day_to_day && <Section title="Day to Day" content={item.day_to_day} />}
                {item.industry_trends && <Section title="Industry Trends" content={item.industry_trends} />}
              </>
            )}

            {/* Job-specific fields */}
            {type === "job" && (
              <>
                {item.avg_salary_usd && <InfoRow label="Avg Salary" value={item.avg_salary_usd} icon="💰" />}
                {item.work_environment && <Section title="Work Environment" content={item.work_environment} />}
              </>
            )}

            {/* University-specific fields */}
            {type === "university" && (
              <>
                <InfoRow label="Location" value={`${item.city ? item.city + ", " : ""}${item.country}`} icon="📍" />
                {item.website && (
                  <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-body text-sm text-primary hover:underline">
                    Visit website <ExternalLink size={12} />
                  </a>
                )}
              </>
            )}

            {/* Cross-mapped related items - clickable to jump between filters */}
            <RelatedSection title="Related Industries" items={item.related_industries || (item.industry ? [item.industry] : [])} targetType="industries" onNavigate={handleTagClick} emoji="🏭" />
            <RelatedSection title="Related Sectors" items={item.related_sectors || (item.sector ? [item.sector] : [])} targetType="sectors" onNavigate={handleTagClick} emoji="📊" />
            <RelatedSection title="Related Domains" items={item.related_domains || (item.domain ? [item.domain] : [])} targetType="domains" onNavigate={handleTagClick} emoji="🌐" />
            <RelatedSection title="Related Careers" items={item.related_careers} targetType="careers" onNavigate={handleTagClick} emoji="💼" />
            <RelatedSection title="Related Job Roles" items={item.related_job_roles || item.job_role_keywords} targetType="jobs" onNavigate={handleTagClick} emoji="👔" />
            <RelatedSection title="Related Skills" items={item.related_skills || item.skills_required} targetType="skills" onNavigate={handleTagClick} emoji="🎯" />
            <RelatedSection title="Related Subjects" items={item.related_subjects} targetType="subjects" onNavigate={handleTagClick} emoji="📚" />
            <RelatedSection title="Related Universities" items={item.related_universities} targetType="universities" onNavigate={handleTagClick} emoji="🎓" />

            {/* Non-navigable tags */}
            <TagList title="Tools & Certifications" items={item.tools_certifications} />
            <TagList title="Keywords" items={item.keywords} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <span>{icon}</span>
    <span className="font-medium text-foreground">{label}:</span>
    <span className="text-muted-foreground">{value}</span>
  </div>
);

const Section = ({ title, content }: { title: string; content: string }) => (
  <div>
    <h4 className="font-display text-sm text-foreground mb-1">{title}</h4>
    <p className="font-body text-xs text-muted-foreground leading-relaxed">{content}</p>
  </div>
);

const RelatedSection = ({ title, items, targetType, onNavigate, emoji }: {
  title: string; items?: string[]; targetType: string; onNavigate: (type: string, name: string) => void; emoji: string;
}) => {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="font-display text-sm text-foreground mb-1.5">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <button
            key={t}
            onClick={() => onNavigate(targetType, t)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-body text-xs hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {emoji} {t} <ArrowRight size={10} />
          </button>
        ))}
      </div>
    </div>
  );
};

const TagList = ({ title, items }: { title: string; items?: string[] }) => {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="font-display text-sm text-foreground mb-1.5">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{t}</span>
        ))}
      </div>
    </div>
  );
};

export default ExploreDetailDialog;
