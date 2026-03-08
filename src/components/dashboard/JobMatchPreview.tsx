import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, ArrowRight, Building2 } from "lucide-react";

interface JobOpp {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  role_type: string | null;
  work_mode: string | null;
  experience_level: string | null;
  domain: string | null;
  is_featured: boolean | null;
}

interface Application {
  id: string;
  status: string | null;
  opportunity_id: string | null;
  fit_score: number | null;
}

const JobMatchPreview = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobOpp[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("job_opportunities").select("id, title, company_name, location, role_type, work_mode, experience_level, domain, is_featured")
        .eq("is_active", true).order("is_featured", { ascending: false }).limit(4),
      supabase.from("job_applications").select("id, status, opportunity_id, fit_score")
        .eq("user_id", user.id).order("applied_at", { ascending: false }).limit(5),
    ]).then(([jobsRes, appsRes]) => {
      setJobs((jobsRes.data || []) as JobOpp[]);
      setApplications((appsRes.data || []) as Application[]);
      setLoading(false);
    });
  }, [user]);

  const appliedIds = new Set(applications.map(a => a.opportunity_id));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Match Highlights
          </CardTitle>
          <Link to="/dashboard/job-matching" className="text-xs text-primary hover:underline flex items-center gap-1">
            See all <ArrowRight size={12} />
          </Link>
        </div>
        <CardDescription>Best-fit roles based on your skills and interests</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="mx-auto text-muted-foreground mb-4" size={40} />
            <h3 className="font-display text-lg text-foreground mb-2">Job Matching</h3>
            <p className="font-body text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Complete your profile and add skills to unlock AI-powered job recommendations
            </p>
            <Link to="/dashboard/job-matching">
              <Button><Briefcase size={14} className="mr-2" />Explore Job Matching</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => {
              const applied = appliedIds.has(job.id);
              const app = applications.find(a => a.opportunity_id === job.id);
              return (
                <Link key={job.id} to="/dashboard/job-matching" className="block">
                  <div className={`p-4 rounded-lg border transition-all hover:border-primary/30 ${
                    job.is_featured ? "border-primary/20 bg-primary/[0.02]" : "border-border"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-body text-sm font-medium text-foreground truncate">{job.title}</h4>
                          {job.is_featured && <Badge className="text-[10px] bg-accent/20 text-accent-foreground">Featured</Badge>}
                        </div>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">{job.company_name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {job.location && (
                            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin size={10} /> {job.location}
                            </span>
                          )}
                          {job.role_type && (
                            <Badge variant="outline" className="text-[10px]">{job.role_type}</Badge>
                          )}
                          {job.work_mode && (
                            <Badge variant="secondary" className="text-[10px]">{job.work_mode}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {applied ? (
                          <Badge variant="default" className="text-[10px]">
                            {app?.status || "Applied"}
                          </Badge>
                        ) : app?.fit_score ? (
                          <span className="font-body text-xs text-primary font-semibold">{Math.round(app.fit_score)}% fit</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Application Stats */}
            {applications.length > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-body text-xs text-muted-foreground">
                  {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
                </span>
                <div className="flex gap-2">
                  {["applied", "interviewing", "offered"].map(status => {
                    const count = applications.filter(a => a.status === status).length;
                    if (count === 0) return null;
                    return (
                      <Badge key={status} variant="secondary" className="text-[10px] capitalize">
                        {count} {status}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobMatchPreview;
