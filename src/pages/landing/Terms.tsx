import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";

const sections: { h: string; b: string }[] = [
  { h: "1. Using MyRaaha", b: "MyRaaha is a career and entrepreneurship guidance platform. By creating an account, you agree to use it lawfully and not to misuse, scrape, or attempt to disrupt the service." },
  { h: "2. Your account", b: "You're responsible for keeping your credentials safe. Notify us immediately of any unauthorized access." },
  { h: "3. Content you create", b: "You own what you write inside MyRaaha (reflections, journals, plans). You grant us a limited license to process it solely to power your personalized experience." },
  { h: "4. AI outputs", b: "Recommendations and AI responses are informational. They are not professional financial, legal, medical, or mental-health advice." },
  { h: "5. Payments", b: "If you purchase a paid plan, billing terms are shown at checkout. Refunds are handled per our refund policy." },
  { h: "6. Termination", b: "You can delete your account at any time. We may suspend accounts that violate these terms." },
  { h: "7. Liability", b: "MyRaaha is provided 'as is'. To the maximum extent permitted by law, we are not liable for indirect or consequential damages." },
  { h: "8. Governing law", b: "These terms are governed by the laws of India. Disputes will be resolved in the courts of Bengaluru, Karnataka." },
];

const Terms = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Terms of Use"
      title={<>The rules of the road — <span className="highlight-mark italic">in plain words.</span></>}
      intro="These terms explain what you can expect from MyRaaha and what we ask of you in return."
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
    <CTABand title="Questions about these terms?" primaryLabel="Contact us" primaryTo="/contact" />
  </LandingLayout>
);

export default Terms;
