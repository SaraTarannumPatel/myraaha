import jsPDF from "jspdf";

interface ResumeData {
  fullName?: string;
  email?: string;
  publicUid?: string;
  experiences: any[];
  achievements: any[];
  interests: any[];
  learningProgress: any[];
  domainAffinity: any[];
  decisionActions: any[];
  identityEvals: any[];
  clarityScores: any[];
  challengeEnrollments: any[];
  aiInsights?: any;
}

/**
 * Generate a Living Resume PDF using jsPDF.
 * Additive feature — does not modify any existing data flow.
 */
export function exportResumePdf(data: ResumeData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string, size = 16) => {
    ensureSpace(size + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(20, 30, 60);
    doc.text(text, margin, y);
    y += size + 4;
    doc.setDrawColor(200, 170, 80);
    doc.setLineWidth(1);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
  };

  const subheading = (text: string) => {
    ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(text, margin, y);
    y += 14;
  };

  const body = (text: string) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    lines.forEach((line: string) => {
      ensureSpace(12);
      doc.text(line, margin, y);
      y += 12;
    });
  };

  const muted = (text: string) => {
    if (!text) return;
    ensureSpace(11);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(text, margin, y);
    y += 11;
  };

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 30, 60);
  doc.text(data.fullName || "My Living Resume", margin, y);
  y += 26;
  if (data.email) muted(data.email);
  if (data.publicUid) muted(`MyRaaha ID: ${data.publicUid}`);
  muted(`Generated ${new Date().toLocaleDateString()}`);
  y += 6;

  // ── AI Summary ────────────────────────────────────────────────────────
  if (data.aiInsights?.summary || data.aiInsights?.narrative) {
    heading("Summary");
    body(data.aiInsights.summary || data.aiInsights.narrative || "");
    y += 4;
  }

  // ── Experiences ───────────────────────────────────────────────────────
  if (data.experiences?.length) {
    heading("Experience");
    data.experiences.slice(0, 20).forEach((e) => {
      subheading(`${e.title || "Untitled"}${e.organization ? " · " + e.organization : ""}`);
      const range = [
        e.start_date ? new Date(e.start_date).toLocaleDateString() : "",
        e.end_date ? new Date(e.end_date).toLocaleDateString() : (e.is_current ? "Present" : ""),
      ].filter(Boolean).join(" – ");
      if (range) muted(range);
      if (e.description) body(e.description);
      y += 4;
    });
  }

  // ── Achievements ──────────────────────────────────────────────────────
  if (data.achievements?.length) {
    heading("Achievements & Badges");
    data.achievements.slice(0, 30).forEach((a) => {
      subheading(a.title || a.achievement_type || "Achievement");
      if (a.description) body(a.description);
    });
  }

  // ── Skills / Interests ────────────────────────────────────────────────
  if (data.interests?.length) {
    heading("Interests & Skills");
    body(data.interests.map((i) => i.name).filter(Boolean).join(" · "));
  }

  // ── Learning ──────────────────────────────────────────────────────────
  if (data.learningProgress?.length) {
    heading("Learning & Growth");
    data.learningProgress.slice(0, 15).forEach((p) => {
      const title = p.mindset_learning_tracks?.title || p.track_id || "Learning Track";
      const status = p.status || (p.completion_percentage ? `${p.completion_percentage}%` : "");
      subheading(`${title}${status ? " — " + status : ""}`);
    });
  }

  // ── Domain Affinity ───────────────────────────────────────────────────
  if (data.domainAffinity?.length) {
    heading("Top Domain Affinity");
    data.domainAffinity.slice(0, 8).forEach((d) => {
      body(`• ${d.domain || d.name || "Domain"} — ${(d.affinity_score ?? 0)}/100`);
    });
  }

  // ── Identity Snapshots ────────────────────────────────────────────────
  if (data.identityEvals?.length) {
    heading("Identity Snapshots");
    data.identityEvals.slice(0, 3).forEach((e) => {
      subheading(new Date(e.evaluated_at).toLocaleDateString());
      if (e.summary) body(e.summary);
    });
  }

  // ── Decisions Taken ───────────────────────────────────────────────────
  if (data.decisionActions?.length) {
    heading("Key Decisions");
    data.decisionActions.slice(0, 10).forEach((d) => {
      body(`• ${d.action_title || d.title || "Decision"}${d.action_type ? " (" + d.action_type + ")" : ""}`);
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `MyRaaha · Living Resume · Page ${i} of ${total}`,
      pageW / 2,
      pageH - 20,
      { align: "center" }
    );
  }

  const safeName = (data.fullName || "MyRaaha-Resume").replace(/[^a-z0-9]+/gi, "-");
  doc.save(`${safeName}-Living-Resume.pdf`);
}
