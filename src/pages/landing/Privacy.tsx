import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";

const sections: { h: string; b: string }[] = [
  { h: "What we collect", b: "Account basics (name, email, phone), the things you tell our tools (compass answers, journal entries, mood check-ins), and standard product analytics so we can keep MyRaaha working." },
  { h: "Why we collect it", b: "To personalize your roadmap and recommendations, to keep your account secure, and to improve the product. We do not sell your data." },
  { h: "Who can see what", b: "By default, your reflections are private to you. Mentors and peer circles only see what you explicitly share, when you share it." },
  { h: "Your controls", b: "Export, edit, or delete your data anytime from Settings. You can revoke any sharing or integration with one click." },
  { h: "Retention", b: "We keep your data while your account is active. When you delete your account, your personal data is removed within 30 days." },
  { h: "Children & youth", b: "MyRaaha is open to users 13+. For users under 18, we apply stricter defaults and minimize data collection." },
  { h: "Contact", b: "Privacy questions: privacy@myraaha.com. We respond within 7 working days." },
];

const Privacy = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Privacy Policy"
      title={<>Your data, <span className="highlight-mark italic">your terms.</span></>}
      intro="MyRaaha is consent-first. This page explains, in plain language, what we collect, why, and how you stay in control."
    />
    <Section>
      <div className="space-y-6 max-w-3xl">
        {sections.map((s) => (
          <article key={s.h} className="rounded-2xl border border-border p-6 sm:p-7">
            <h3 className="font-display text-xl sm:text-2xl text-primary">{s.h}</h3>
            <p className="font-body text-base text-foreground/80 mt-2 leading-relaxed">{s.b}</p>
          </article>
        ))}
        <p className="font-body text-sm text-foreground/60">Last updated: May 2026</p>
      </div>
    </Section>
    <CTABand title="Have a privacy question we didn't answer?" primaryLabel="Contact us" primaryTo="/contact" />
  </LandingLayout>
);

export default Privacy;
