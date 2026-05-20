import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";

const cookies = [
  { name: "Essential", purpose: "Authentication, session, security. These cannot be turned off.", retention: "Session / 30 days" },
  { name: "Functional", purpose: "Remembering your preferences and saved state across visits.", retention: "Up to 12 months" },
  { name: "Analytics", purpose: "Anonymous usage analytics to help us improve the product.", retention: "Up to 14 months" },
];

const Cookies = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Cookie Policy"
      title={<>The cookies we use — <span className="highlight-mark italic">and why.</span></>}
      intro="A short, jargon-free breakdown of how MyRaaha uses cookies and similar technologies."
    />
    <Section>
      <div className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary/40">
              <tr>
                <th className="font-body text-sm uppercase tracking-wide text-grey-label p-4">Type</th>
                <th className="font-body text-sm uppercase tracking-wide text-grey-label p-4">Purpose</th>
                <th className="font-body text-sm uppercase tracking-wide text-grey-label p-4">Retention</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((c) => (
                <tr key={c.name} className="border-t border-border align-top">
                  <td className="p-4 font-display text-primary">{c.name}</td>
                  <td className="p-4 font-body text-foreground/80">{c.purpose}</td>
                  <td className="p-4 font-body text-foreground/60">{c.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-body text-foreground/75">
          You can manage non-essential cookies anytime in Settings, or via your browser's privacy controls.
        </p>
        <p className="font-body text-sm text-foreground/60">Last updated: May 2026</p>
      </div>
    </Section>
    <CTABand title="Read our full privacy policy" primaryLabel="Privacy Policy" primaryTo="/privacy" />
  </LandingLayout>
);

export default Cookies;
