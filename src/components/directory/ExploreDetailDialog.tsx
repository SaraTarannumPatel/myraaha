import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, ArrowRight, Users, Bot, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExploreDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any;
  type: string;
  onNavigate?: (type: string, name: string) => void;
}

const ExploreDetailDialog = ({ open, onClose, item, type, onNavigate }: ExploreDetailDialogProps) => {
  const navigate = useNavigate();
  if (!item) return null;

  const title = item.title || item.name;

  const handleTagClick = (targetType: string, name: string) => {
    onNavigate?.(targetType, name);
    onClose();
  };

  const exploreContext = {
    context: title,
    type,
    item: {
      title,
      domain: item.domain,
      industry: item.industry,
      sector: item.sector,
      description: item.description,
      related_skills: item.related_skills || item.skills_required || item.top_skills,
      related_careers: item.related_careers || item.top_careers,
      related_job_roles: item.related_job_roles || item.job_role_keywords || item.top_job_roles,
      related_domains: item.related_domains || item.top_domains,
      related_industries: item.related_industries || item.top_industries,
      soft_skills: item.soft_skills || item.soft_skills_in_demand,
      interests: item.interests,
      keywords: item.keywords,
    },
  };
  const handleMentor = () => { onClose(); navigate("/career/mentor-matchmaking", { state: { exploreContext } }); };
  const handleTherapist = () => { onClose(); navigate("/career/ai-career-therapist", { state: { exploreContext } }); };
  const handleRoadmap = () => { onClose(); navigate("/career/roadmap?tab=suggested&from=explore", { state: { exploreContext } }); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[90vh] sm:max-h-[85vh] p-0 overflow-hidden rounded-2xl">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-5 sm:p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                <span className="text-2xl">{item.icon_emoji || defaultEmoji(type)}</span>
                {title}
              </DialogTitle>
            </DialogHeader>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {item.domain && <Badge variant="secondary">{item.domain}</Badge>}
              {item.category && <Badge variant="outline">{item.category}</Badge>}
              {item.difficulty && <Badge variant="outline">{item.difficulty}</Badge>}
              {item.demand_level && <Badge variant="outline">📈 {item.demand_level}</Badge>}
              {item.experience_level && <Badge variant="outline">{item.experience_level}</Badge>}
              {item.platform && <Badge variant="secondary">{item.platform}</Badge>}
              {item.industry && <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleTagClick("industries", item.industry)}>🏭 {item.industry}</Badge>}
              {item.sector && <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleTagClick("sectors", item.sector)}>📊 {item.sector}</Badge>}
              {item.ranking_tier && <Badge variant="secondary">{item.ranking_tier}</Badge>}
              {item.type && type === "university" && <Badge variant="outline">{item.type}</Badge>}
              {item.continent && <Badge variant="outline">{item.continent}</Badge>}
              {item.duration && <Badge variant="outline">⏱ {item.duration}</Badge>}
              {item.avg_rating && <Badge variant="outline">⭐ {item.avg_rating}</Badge>}
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Description</h4>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Universal fields */}
            {(item.salary_range || item.avg_salary_usd) && <InfoRow label="Salary Range" value={item.salary_range || item.avg_salary_usd} icon="💰" />}
            {item.price_range && <InfoRow label="Price" value={item.price_range} icon="💰" />}
            {item.growth_trajectory && <InfoRow label="Growth Trajectory" value={item.growth_trajectory} icon="📈" />}
            {item.population && <InfoRow label="Population" value={item.population} icon="👥" />}
            {item.gdp_rank && <InfoRow label="GDP Rank" value={item.gdp_rank} icon="🏦" />}

            {/* Career-specific */}
            {item.day_to_day && <Section title="Day to Day" content={item.day_to_day} />}
            {item.industry_trends && <Section title="Industry Trends" content={item.industry_trends} />}
            {item.work_environment && <Section title="Work Environment" content={item.work_environment} />}

            {/* University location */}
            {type === "university" && item.country && <InfoRow label="Location" value={`${item.city ? item.city + ", " : ""}${item.country}`} icon="📍" />}
            {item.website && (
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-body text-sm text-primary hover:underline">
                Visit website <ExternalLink size={12} />
              </a>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-body text-sm text-primary hover:underline">
                View course <ExternalLink size={12} />
              </a>
            )}

            {/* Soft Skills & Interests */}
            <TagList title="Soft Skills" items={item.soft_skills || item.soft_skills_in_demand} />
            <TagList title="You'll love this if you're interested in" items={item.interests} />
            <TagList title="Countries in Demand" items={item.countries_in_demand} />
            <TagList title="Official Languages" items={item.official_languages} />

            {/* Cross-mapped related items */}
            <RelatedSection title="Related Industries" items={item.related_industries || item.top_industries || (item.industry ? [item.industry] : [])} targetType="industries" onNavigate={handleTagClick} emoji="🏭" />
            <RelatedSection title="Related Sectors" items={item.related_sectors || item.top_sectors || (item.sector ? [item.sector] : [])} targetType="sectors" onNavigate={handleTagClick} emoji="📊" />
            <RelatedSection title="Related Domains" items={item.related_domains || item.top_domains || (item.domain ? [item.domain] : [])} targetType="domains" onNavigate={handleTagClick} emoji="🌐" />
            <RelatedSection title="Related Careers" items={item.related_careers || item.top_careers} targetType="careers" onNavigate={handleTagClick} emoji="💼" />
            <RelatedSection title="Related Job Roles" items={item.related_job_roles || item.job_role_keywords || item.top_job_roles} targetType="jobs" onNavigate={handleTagClick} emoji="👔" />
            <RelatedSection title="Related Skills" items={item.related_skills || item.skills_required || item.top_skills} targetType="skills" onNavigate={handleTagClick} emoji="🎯" />
            <RelatedSection title="Related Subjects" items={item.related_subjects || item.top_subjects} targetType="subjects" onNavigate={handleTagClick} emoji="📚" />
            <RelatedSection title="Related Universities" items={item.related_universities || item.top_universities} targetType="universities" onNavigate={handleTagClick} emoji="🎓" />
            <RelatedSection title="Related Courses" items={item.related_courses || item.top_courses} targetType="courses" onNavigate={handleTagClick} emoji="💻" />
            <RelatedSection title="Related Countries" items={item.related_countries} targetType="countries" onNavigate={handleTagClick} emoji="🌍" />

            {/* Non-navigable tags */}
            <TagList title="Tools & Certifications" items={item.tools_certifications} />
            <TagList title="Keywords" items={item.keywords} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleMentor}>
                <Users size={14} /> Talk to a Mentor
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleTherapist}>
                <Bot size={14} /> AI Career Therapist
              </Button>
              <Button size="sm" className="flex-1 text-xs gap-1.5" onClick={handleRoadmap}>
                <Map size={14} /> Create a Roadmap
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const defaultEmoji = (type: string) => ({ career: "💼", job: "👔", domain: "🌐", university: "🎓", industry: "🏭", sector: "📊", skill: "🎯", subject: "📚", course: "💻", country: "🌍" }[type] || "📁");

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
        {items.slice(0, 20).map((t) => (
          <button key={t} onClick={() => onNavigate(targetType, t)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-body text-xs hover:bg-primary/20 transition-colors cursor-pointer">
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
