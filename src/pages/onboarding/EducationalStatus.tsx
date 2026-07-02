import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowRight, ArrowLeft, GraduationCap, Building2, BookOpen, Layers,
  Sparkles, Trophy, Users, Target, Compass, Plus, X, CheckCircle2,
} from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

// ─── Option lists ────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "school_1_10", label: "School Student (Class 1–10)" },
  { value: "class_11", label: "Class 11" },
  { value: "class_12", label: "Class 12" },
  { value: "diploma", label: "Diploma Student" },
  { value: "undergraduate", label: "Undergraduate Student" },
  { value: "other", label: "Other" },
];
const SCHOOL_BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge"];
const COLLEGE_TYPES = ["Government", "Private", "Autonomous", "Deemed University", "Other"];
const STREAMS = ["Science", "Commerce", "Arts/Humanities", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const CONFIDENCE = ["beginner", "intermediate", "advanced"] as const;
const ACTIVITY_OPTIONS = [
  "Hackathons", "Olympiads", "Competitions", "Debates", "Sports",
  "Cultural Activities", "Student Clubs", "Volunteering", "NCC", "NSS", "Other", "None",
];
const PREP_OPTIONS = [
  "School Exams", "Board Exams", "JEE", "NEET", "CUET", "CLAT",
  "CA Foundation", "CAT", "GATE", "Government Exams", "Other", "Not Preparing",
];
const HELP_OPTIONS = [
  "Career Discovery", "Career Switching Guidance", "College Selection",
  "Higher Studies Planning", "Skill Development", "Internship Guidance",
  "Project Recommendations", "Resume Building", "Scholarship Opportunities",
  "Exam Planning", "Networking Opportunities",
];
const DOMAIN_OPTIONS = [
  "Software Engineering", "AI/ML", "Data Science", "Finance", "Marketing",
  "Design", "Law", "Medicine", "Psychology", "Entrepreneurship", "Civil Services",
  "Education", "Media & Creative", "Sports", "Sustainability", "Public Policy",
];

// 17 industry sectors mapped 1:1 to the career_intel_* tables in the DB.
const SECTOR_OPTIONS: { slug: string; label: string }[] = [
  { slug: "agri_env_natural_resources", label: "Agriculture, Environment & Natural Resources" },
  { slug: "education", label: "Education" },
  { slug: "energy_utilities", label: "Energy & Utilities" },
  { slug: "financial_services", label: "Financial Services" },
  { slug: "govt_public_sector", label: "Government & Public Sector" },
  { slug: "healthcare_life_sciences", label: "Healthcare & Life Sciences" },
  { slug: "hospitality_tourism_travel", label: "Hospitality, Tourism & Travel" },
  { slug: "legal_prof_services", label: "Legal & Professional Services" },
  { slug: "manufacturing_engineering", label: "Manufacturing & Engineering" },
  { slug: "media_ent_creative", label: "Media, Entertainment & Creative" },
  { slug: "ngo_development", label: "NGO & Social Development" },
  { slug: "real_estate_construction", label: "Real Estate & Construction" },
  { slug: "retail_consumer_goods", label: "Retail & Consumer Goods" },
  { slug: "sports", label: "Sports" },
  { slug: "tech_it", label: "Technology & IT" },
  { slug: "telecommunications", label: "Telecommunications" },
  { slug: "transport_logistics", label: "Transport & Logistics" },
];

interface SkillItem { name: string; confidence: typeof CONFIDENCE[number] | "" }
interface CertItem { course_name: string; platform: string; completion_year: string }
interface ProjectItem { project_name: string; description: string; skills_used: string; link: string }
interface ActivityItem { activity_type: string; title: string; role: string; year: string; achievement: string }
interface LeadItem { position_title: string; organization: string; duration: string; description: string }

// ─── Reusable bits ───────────────────────────────────────────────────────
const Chip = ({ active, onClick, children }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-2 rounded-full border-2 text-sm font-body transition-all ${
      active
        ? "bg-primary/10 border-primary text-foreground font-semibold"
        : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
    }`}
  >
    {active && <CheckCircle2 size={13} className="inline mr-1 text-primary" />}
    {children}
  </button>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
  <div className="text-center space-y-3">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
      <Icon size={22} className="text-primary" />
    </div>
    <div>
      <h1 className="onboarding-step-heading text-primary">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground font-body mt-1">{subtitle}</p>}
    </div>
  </div>
);

const SECTION_LABELS = [
  "Academic Status", "Stream / Course", "Subjects", "Skills",
  "Certifications", "Projects", "Activities", "Leadership",
  "Goals", "Future Interests",
];

// ─── Main component ──────────────────────────────────────────────────────
const EducationalStatus = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 1. Status
  const [status, setStatus] = useState("");
  const [institution, setInstitution] = useState("");
  const [boardType, setBoardType] = useState("");
  // 2. Stream / course
  const [stream, setStream] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  // 3. Subjects
  const [currentSubjects, setCurrentSubjects] = useState<string[]>([""]);
  const [favSubjects, setFavSubjects] = useState<string[]>([]);
  const [hardSubjects, setHardSubjects] = useState<string[]>([]);
  const [favDraft, setFavDraft] = useState("");
  const [hardDraft, setHardDraft] = useState("");
  // 4. Skills
  const [skills, setSkills] = useState<SkillItem[]>([{ name: "", confidence: "" }]);
  // 5. Certifications
  const [hasCerts, setHasCerts] = useState<boolean | null>(null);
  const [certs, setCerts] = useState<CertItem[]>([{ course_name: "", platform: "", completion_year: "" }]);
  // 6. Projects
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([{ project_name: "", description: "", skills_used: "", link: "" }]);
  // 7. Activities
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([{ activity_type: "", title: "", role: "", year: "", achievement: "" }]);
  // 8. Leadership
  const [hasLead, setHasLead] = useState<boolean | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([{ position_title: "", organization: "", duration: "", description: "" }]);
  // 9. Goals
  const [preparing, setPreparing] = useState<string[]>([]);
  const [helpWith, setHelpWith] = useState<string[]>([]);
  // 10. Future interests
  const [domains, setDomains] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [curious, setCurious] = useState("");

  const total = SECTION_LABELS.length;
  const progressPct = 55 + Math.round((section / total) * 30);

  const toggleArr = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  // Conditional content per section
  const showStream = status === "class_11" || status === "class_12";
  const showCourseYear = status === "undergraduate" || status === "diploma";

  // Validation per section
  const canNext = () => {
    switch (section) {
      case 0: return !!status && institution.trim().length > 0;
      case 1:
        if (showStream) return !!stream;
        if (showCourseYear) return course.trim().length > 0 && !!year;
        return true;
      case 2: return currentSubjects.some(s => s.trim()) && favSubjects.length > 0;
      case 3: return skills.some(s => s.name.trim());
      case 4: return hasCerts !== null;
      case 5: return hasProjects !== null;
      case 6: return true;
      case 7: return hasLead !== null;
      case 8: return helpWith.length > 0;
      case 9: return domains.length > 0 && sectors.length > 0;
      default: return true;
    }
  };

  const goNext = () => {
    if (!canNext()) return;
    // skip Section 1 (stream/course) when neither condition applies
    if (section === 0 && !(status === "class_11" || status === "class_12" || status === "undergraduate" || status === "diploma")) {
      setSection(2);
      return;
    }
    if (section < total - 1) setSection(section + 1);
    else handleFinish();
  };
  const goBack = () => {
    if (section === 2 && !showStream && !showCourseYear) { setSection(0); return; }
    if (section === 0) navigate("/onboarding/journey");
    else setSection(section - 1);
  };

  const handleFinish = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      // Main row (upsert)
      await (supabase as any).from("user_education_status").upsert({
        user_id: user.id,
        educational_status: status,
        institution_name: institution.trim() || null,
        board_or_university_type: boardType || null,
        stream: showStream ? stream : null,
        course_program: showCourseYear ? course.trim() : null,
        year_of_study: showCourseYear ? year : null,
        prepping_for: preparing,
        looking_for_help: helpWith,
        career_domains: domains,
        curious_careers: curious.trim() || null,
      }, { onConflict: "user_id" });

      // Subjects — wipe + insert
      await (supabase as any).from("user_subjects").delete().eq("user_id", user.id);
      const subjectRows = [
        ...currentSubjects.filter(s => s.trim()).map(s => ({ user_id: user.id, subject_name: s.trim(), relation: "current" })),
        ...favSubjects.map(s => ({ user_id: user.id, subject_name: s, relation: "favorite" })),
        ...hardSubjects.map(s => ({ user_id: user.id, subject_name: s, relation: "difficult" })),
      ];
      if (subjectRows.length) await (supabase as any).from("user_subjects").insert(subjectRows);

      // Skills
      await (supabase as any).from("user_skills_profile").delete().eq("user_id", user.id);
      const skillRows = skills.filter(s => s.name.trim()).map(s => ({
        user_id: user.id, skill_name: s.name.trim(), confidence: s.confidence || null,
      }));
      if (skillRows.length) await (supabase as any).from("user_skills_profile").insert(skillRows);

      // Certifications
      if (hasCerts) {
        const rows = certs.filter(c => c.course_name.trim()).map(c => ({
          user_id: user.id, course_name: c.course_name.trim(),
          platform: c.platform.trim() || null, completion_year: c.completion_year.trim() || null,
        }));
        if (rows.length) await (supabase as any).from("user_certifications").insert(rows);
      }

      // Projects
      if (hasProjects) {
        const rows = projects.filter(p => p.project_name.trim()).map(p => ({
          user_id: user.id, project_name: p.project_name.trim(),
          description: p.description.trim() || null,
          skills_used: p.skills_used ? p.skills_used.split(",").map(s => s.trim()).filter(Boolean) : [],
          link: p.link.trim() || null,
        }));
        if (rows.length) await (supabase as any).from("user_projects_profile").insert(rows);
      }

      // Activities
      const actRows = activities.filter(a => a.title.trim()).map(a => ({
        user_id: user.id, activity_type: a.activity_type || "Other", title: a.title.trim(),
        role: a.role.trim() || null, year: a.year.trim() || null, achievement: a.achievement.trim() || null,
      }));
      if (actRows.length) await (supabase as any).from("user_activities").insert(actRows);

      // Leadership
      if (hasLead) {
        const rows = leads.filter(l => l.position_title.trim()).map(l => ({
          user_id: user.id, position_title: l.position_title.trim(),
          organization: l.organization.trim() || null, duration: l.duration.trim() || null,
          description: l.description.trim() || null,
        }));
        if (rows.length) await (supabase as any).from("user_leadership").insert(rows);
      }

      // Mirror highest_education on profile for the Roadmap builder
      const highest =
        status === "undergraduate" ? "undergraduate" :
        status === "class_12" ? "class_11_12" :
        status === "class_11" ? "class_11_12" :
        status === "diploma" ? "diploma" :
        status === "school_1_10" ? "class_9_10" : null;

      await updateProfile({
        ...(highest ? { highest_education: highest } as any : {}),
        onboarding_status: "consent" as any,
      } as any);

      // Sectors of curiosity — wipe + insert, then trigger personalization
      try {
        await (supabase as any).from("user_onboarding_sectors").delete().eq("user_id", user.id);
        if (sectors.length) {
          await (supabase as any).from("user_onboarding_sectors").insert(
            sectors.map((slug, i) => ({ user_id: user.id, sector_slug: slug, rank: i + 1 }))
          );
        }
        const { runUserPersonalization } = await import("@/lib/personalizationPipeline");
        runUserPersonalization(user.id).catch(() => {});
      } catch (e) {
        console.warn("Sector save failed", e);
      }

      toast.success("Your education profile is saved 🎓");
      navigate("/onboarding/consent");
    } catch (e: any) {
      console.error(e);
      toast.error("Couldn't save — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      <OnboardingProgressBar progress={progressPct} />
      <OnboardingRewardBanner currentProgress={progressPct} />
      <div className="flex-1 onboarding-scroll-safe onboarding-page-inner flex flex-col items-center justify-center p-4 sm:p-6 py-4 pb-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-6 my-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="progress-step-label text-muted-foreground uppercase tracking-wider">
                {SECTION_LABELS[section]}
              </span>
              <span className="progress-step-counter text-muted-foreground">
                {section + 1} / {total}
              </span>
            </div>
            <div className="flex gap-1">
              {SECTION_LABELS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= section ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">

              {/* SECTION 0 — Academic Status */}
              {section === 0 && (
                <>
                  <SectionHeader icon={GraduationCap} title="Where are you in your studies right now?" subtitle="Helps us suggest the right next education + skill moves." />
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-body text-foreground mb-2 block">Your current status *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STATUS_OPTIONS.map(o => (
                          <button key={o.value} type="button" onClick={() => setStatus(o.value)}
                            className={`text-left p-3 rounded-lg border-2 font-body text-sm transition-all ${
                              status === o.value ? "border-primary bg-primary/10 font-semibold" : "border-border hover:border-primary/30"
                            }`}>
                            {status === o.value && <CheckCircle2 size={14} className="inline mr-1.5 text-primary" />}
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-body text-foreground mb-2 block">School / College / University name *</label>
                      <Input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Delhi Public School" className="h-11" />
                    </div>
                    <div>
                      <label className="text-sm font-body text-foreground mb-2 block">Board / University type</label>
                      <div className="flex flex-wrap gap-2">
                        {(status === "undergraduate" || status === "diploma" ? COLLEGE_TYPES : SCHOOL_BOARDS).map(b => (
                          <Chip key={b} active={boardType === b} onClick={() => setBoardType(boardType === b ? "" : b)}>{b}</Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 1 — Stream / Course */}
              {section === 1 && (
                <>
                  <SectionHeader icon={Layers} title={showStream ? "Which stream are you in?" : "Tell us about your program"} />
                  {showStream && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {STREAMS.map(s => <Chip key={s} active={stream === s} onClick={() => setStream(s)}>{s}</Chip>)}
                    </div>
                  )}
                  {showCourseYear && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-body text-foreground mb-2 block">Course / Program *</label>
                        <Input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="h-11" />
                      </div>
                      <div>
                        <label className="text-sm font-body text-foreground mb-2 block">Which year? *</label>
                        <div className="flex flex-wrap gap-2">
                          {YEARS.map(y => <Chip key={y} active={year === y} onClick={() => setYear(y)}>{y}</Chip>)}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* SECTION 2 — Subjects */}
              {section === 2 && (
                <>
                  <SectionHeader icon={BookOpen} title="Your subjects" subtitle="Drives the kind of careers and skills we recommend." />
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-body text-foreground mb-2 block">Subjects you're studying *</label>
                      <div className="space-y-2">
                        {currentSubjects.map((s, i) => (
                          <div key={i} className="flex gap-2">
                            <Input value={s} onChange={e => { const a = [...currentSubjects]; a[i] = e.target.value; setCurrentSubjects(a); }} placeholder={`Subject ${i + 1}`} className="h-11" />
                            {currentSubjects.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => setCurrentSubjects(currentSubjects.filter((_, j) => j !== i))}><X size={16} /></Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setCurrentSubjects([...currentSubjects, ""])}><Plus size={14} className="mr-1" /> Add subject</Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-body text-foreground mb-2 block">Favorite subjects *</label>
                      <div className="flex gap-2 mb-2">
                        <Input value={favDraft} onChange={e => setFavDraft(e.target.value)} placeholder="Type and add" onKeyDown={e => { if (e.key === "Enter" && favDraft.trim()) { setFavSubjects([...favSubjects, favDraft.trim()]); setFavDraft(""); }}} className="h-11" />
                        <Button onClick={() => { if (favDraft.trim()) { setFavSubjects([...favSubjects, favDraft.trim()]); setFavDraft(""); }}}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {favSubjects.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-sm font-body flex items-center gap-1.5">
                            {s} <button onClick={() => setFavSubjects(favSubjects.filter((_, j) => j !== i))}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-body text-foreground mb-2 block">Subjects you find difficult <span className="text-muted-foreground">(optional)</span></label>
                      <div className="flex gap-2 mb-2">
                        <Input value={hardDraft} onChange={e => setHardDraft(e.target.value)} placeholder="Type and add" onKeyDown={e => { if (e.key === "Enter" && hardDraft.trim()) { setHardSubjects([...hardSubjects, hardDraft.trim()]); setHardDraft(""); }}} className="h-11" />
                        <Button onClick={() => { if (hardDraft.trim()) { setHardSubjects([...hardSubjects, hardDraft.trim()]); setHardDraft(""); }}}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hardSubjects.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-muted text-sm font-body flex items-center gap-1.5">
                            {s} <button onClick={() => setHardSubjects(hardSubjects.filter((_, j) => j !== i))}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 3 — Skills */}
              {section === 3 && (
                <>
                  <SectionHeader icon={Sparkles} title="What skills do you have?" subtitle="Add a few — we'll rate confidence next." />
                  <div className="space-y-3">
                    {skills.map((s, i) => (
                      <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                        <div className="flex gap-2">
                          <Input value={s.name} onChange={e => { const a = [...skills]; a[i].name = e.target.value; setSkills(a); }} placeholder="Skill (e.g. Python, Canva, Public Speaking)" className="h-11" />
                          {skills.length > 1 && <Button variant="ghost" size="icon" onClick={() => setSkills(skills.filter((_, j) => j !== i))}><X size={16} /></Button>}
                        </div>
                        {s.name.trim() && (
                          <div className="flex flex-wrap gap-1.5">
                            {CONFIDENCE.map(c => (
                              <button key={c} type="button" onClick={() => { const a = [...skills]; a[i].confidence = c; setSkills(a); }}
                                className={`px-3 py-1 rounded-full text-xs font-body capitalize border ${s.confidence === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setSkills([...skills, { name: "", confidence: "" }])}><Plus size={14} className="mr-1" /> Add skill</Button>
                  </div>
                </>
              )}

              {/* SECTION 4 — Certifications */}
              {section === 4 && (
                <>
                  <SectionHeader icon={Trophy} title="Any certifications or online courses?" />
                  <div className="flex gap-3 justify-center">
                    <Chip active={hasCerts === true} onClick={() => setHasCerts(true)}>Yes</Chip>
                    <Chip active={hasCerts === false} onClick={() => setHasCerts(false)}>Not yet</Chip>
                  </div>
                  {hasCerts && (
                    <div className="space-y-3">
                      {certs.map((c, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                          <Input value={c.course_name} onChange={e => { const a = [...certs]; a[i].course_name = e.target.value; setCerts(a); }} placeholder="Course name (e.g. Google Data Analytics)" className="h-11" />
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={c.platform} onChange={e => { const a = [...certs]; a[i].platform = e.target.value; setCerts(a); }} placeholder="Platform" className="h-11" />
                            <Input value={c.completion_year} onChange={e => { const a = [...certs]; a[i].completion_year = e.target.value; setCerts(a); }} placeholder="Year" className="h-11" />
                          </div>
                          {certs.length > 1 && <Button variant="ghost" size="sm" onClick={() => setCerts(certs.filter((_, j) => j !== i))}><X size={14} /> Remove</Button>}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setCerts([...certs, { course_name: "", platform: "", completion_year: "" }])}><Plus size={14} className="mr-1" /> Add another</Button>
                    </div>
                  )}
                </>
              )}

              {/* SECTION 5 — Projects */}
              {section === 5 && (
                <>
                  <SectionHeader icon={Building2} title="Have you worked on any projects?" />
                  <div className="flex gap-3 justify-center">
                    <Chip active={hasProjects === true} onClick={() => setHasProjects(true)}>Yes</Chip>
                    <Chip active={hasProjects === false} onClick={() => setHasProjects(false)}>Not yet</Chip>
                  </div>
                  {hasProjects && (
                    <div className="space-y-3">
                      {projects.map((p, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                          <Input value={p.project_name} onChange={e => { const a = [...projects]; a[i].project_name = e.target.value; setProjects(a); }} placeholder="Project name" className="h-11" />
                          <Textarea value={p.description} onChange={e => { const a = [...projects]; a[i].description = e.target.value; setProjects(a); }} placeholder="Short description" />
                          <Input value={p.skills_used} onChange={e => { const a = [...projects]; a[i].skills_used = e.target.value; setProjects(a); }} placeholder="Skills used (comma-separated)" className="h-11" />
                          <Input value={p.link} onChange={e => { const a = [...projects]; a[i].link = e.target.value; setProjects(a); }} placeholder="Link (GitHub / Behance / Drive — optional)" className="h-11" />
                          {projects.length > 1 && <Button variant="ghost" size="sm" onClick={() => setProjects(projects.filter((_, j) => j !== i))}><X size={14} /> Remove</Button>}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setProjects([...projects, { project_name: "", description: "", skills_used: "", link: "" }])}><Plus size={14} className="mr-1" /> Add project</Button>
                    </div>
                  )}
                </>
              )}

              {/* SECTION 6 — Activities */}
              {section === 6 && (
                <>
                  <SectionHeader icon={Users} title="Activities & exposure" subtitle="Hackathons, clubs, sports — anything you've shown up for." />
                  <div>
                    <label className="text-sm font-body text-foreground mb-2 block">What have you participated in?</label>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITY_OPTIONS.map(a => <Chip key={a} active={activityTypes.includes(a)} onClick={() => toggleArr(activityTypes, a, setActivityTypes)}>{a}</Chip>)}
                    </div>
                  </div>
                  {activityTypes.length > 0 && !activityTypes.includes("None") && (
                    <div className="space-y-3">
                      <p className="text-sm font-body text-foreground">Add details (optional)</p>
                      {activities.map((a, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                          <Input value={a.title} onChange={e => { const arr = [...activities]; arr[i].title = e.target.value; setActivities(arr); }} placeholder="Event / activity title" className="h-11" />
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={a.activity_type} onChange={e => { const arr = [...activities]; arr[i].activity_type = e.target.value; setActivities(arr); }} placeholder="Type" className="h-11" />
                            <Input value={a.year} onChange={e => { const arr = [...activities]; arr[i].year = e.target.value; setActivities(arr); }} placeholder="Year" className="h-11" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={a.role} onChange={e => { const arr = [...activities]; arr[i].role = e.target.value; setActivities(arr); }} placeholder="Your role" className="h-11" />
                            <Input value={a.achievement} onChange={e => { const arr = [...activities]; arr[i].achievement = e.target.value; setActivities(arr); }} placeholder="Achievement (optional)" className="h-11" />
                          </div>
                          {activities.length > 1 && <Button variant="ghost" size="sm" onClick={() => setActivities(activities.filter((_, j) => j !== i))}><X size={14} /> Remove</Button>}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setActivities([...activities, { activity_type: "", title: "", role: "", year: "", achievement: "" }])}><Plus size={14} className="mr-1" /> Add another</Button>
                    </div>
                  )}
                </>
              )}

              {/* SECTION 7 — Leadership */}
              {section === 7 && (
                <>
                  <SectionHeader icon={Trophy} title="Any leadership positions?" subtitle="Class rep, club head, house captain — anything counts." />
                  <div className="flex gap-3 justify-center">
                    <Chip active={hasLead === true} onClick={() => setHasLead(true)}>Yes</Chip>
                    <Chip active={hasLead === false} onClick={() => setHasLead(false)}>Not yet</Chip>
                  </div>
                  {hasLead && (
                    <div className="space-y-3">
                      {leads.map((l, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                          <Input value={l.position_title} onChange={e => { const a = [...leads]; a[i].position_title = e.target.value; setLeads(a); }} placeholder="Position title" className="h-11" />
                          <Input value={l.organization} onChange={e => { const a = [...leads]; a[i].organization = e.target.value; setLeads(a); }} placeholder="Organization / group" className="h-11" />
                          <Input value={l.duration} onChange={e => { const a = [...leads]; a[i].duration = e.target.value; setLeads(a); }} placeholder="Duration (e.g. 2024–2025)" className="h-11" />
                          <Textarea value={l.description} onChange={e => { const a = [...leads]; a[i].description = e.target.value; setLeads(a); }} placeholder="What did you do? (short)" />
                          {leads.length > 1 && <Button variant="ghost" size="sm" onClick={() => setLeads(leads.filter((_, j) => j !== i))}><X size={14} /> Remove</Button>}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setLeads([...leads, { position_title: "", organization: "", duration: "", description: "" }])}><Plus size={14} className="mr-1" /> Add another</Button>
                    </div>
                  )}
                </>
              )}

              {/* SECTION 8 — Goals */}
              {section === 8 && (
                <>
                  <SectionHeader icon={Target} title="What are you preparing for & how can we help?" />
                  <div>
                    <label className="text-sm font-body text-foreground mb-2 block">Currently preparing for</label>
                    <div className="flex flex-wrap gap-2">
                      {PREP_OPTIONS.map(p => <Chip key={p} active={preparing.includes(p)} onClick={() => toggleArr(preparing, p, setPreparing)}>{p}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body text-foreground mb-2 block">What kind of help do you want from MyRaaha? *</label>
                    <div className="flex flex-wrap gap-2">
                      {HELP_OPTIONS.map(h => <Chip key={h} active={helpWith.includes(h)} onClick={() => toggleArr(helpWith, h, setHelpWith)}>{h}</Chip>)}
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 9 — Future Interests */}
              {section === 9 && (
                <>
                  <SectionHeader icon={Compass} title="Where does your curiosity lean?" subtitle="Pick the career domains and sectors that pull you — even slightly." />
                  <div>
                    <label className="text-sm font-body text-foreground mb-2 block">Career domains of interest *</label>
                    <div className="flex flex-wrap gap-2">
                      {DOMAIN_OPTIONS.map(d => <Chip key={d} active={domains.includes(d)} onClick={() => toggleArr(domains, d, setDomains)}>{d}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body text-foreground mb-2 block">Which sectors spark your curiosity? * <span className="text-muted-foreground font-normal">(pick any that interest you)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {SECTOR_OPTIONS.map(s => (
                        <Chip key={s.slug} active={sectors.includes(s.slug)} onClick={() => toggleArr(sectors, s.slug, setSectors)}>{s.label}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body text-foreground mb-2 block">Any careers you're curious about but don't fully understand?</label>
                    <Textarea value={curious} onChange={e => setCurious(e.target.value)} placeholder="e.g. Investment Banking, Product Management..." />
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={goBack} className="font-body h-[48px] min-h-[48px] px-4 rounded-full">
              <ArrowLeft size={18} /> Back
            </Button>
            <Button onClick={goNext} disabled={!canNext() || submitting}
              className="bg-primary text-white rounded-full h-[52px] min-h-[52px] px-8 font-body font-semibold hover:bg-primary/95 disabled:opacity-50">
              {submitting ? "Saving..." : section === total - 1 ? "Finish" : "Next"} <ArrowRight size={18} className="ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EducationalStatus;
