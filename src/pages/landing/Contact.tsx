import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import { Mail } from "lucide-react";
import heroContact from "@/assets/landing/hero-contact.jpg";

const faqs = [
  ["Is MyRaaha free to use?", "We're building toward an accessible pricing model that doesn't price out the people who need it most. During our early phase, access is limited and invite-based."],
  ["I'm an educator / school / college. Can I bring MyRaaha to my institution?", "Yes. Institutional partnerships are a core part of how we scale. Reach out through the contact form with some context."],
  ["I want to mentor on the platform. How does that work?", "MyRaaha's mentorship model is designed to be meaningful, not transactional. Use the 'Become a Mentor' option above to express interest."],
  ["I'm a journalist / researcher interested in MyRaaha. Who should I contact?", "Write to us directly at hello@myraaha.com with context about your work."],
  ["I found an issue or have feedback about the platform. Where do I send it?", "The contact form above, or hello@myraaha.com. Honest feedback is one of the most valuable things you can give us."],
];

const Contact = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Contact"
      title={<>We're here. Reach out <span className="highlight-mark italic">when you're ready.</span></>}
      intro="This is not a support ticket system. This is a human contact. We typically respond within 2–3 working days. We read everything. We reply to everything that deserves a reply."
      illustration={heroContact}
      illustrationAlt="An open envelope releasing a glowing letter, surrounded by message bubbles and a phone"
    />

    <Section>
      <div className="grid lg:grid-cols-12 gap-10">
        <form className="lg:col-span-7 space-y-4">
          {[
            ["name", "Your name", "text"],
            ["email", "Your email", "email"],
            ["source", "How did you find us? (optional)", "text"],
          ].map(([id, label, type]) => (
            <label key={id} className="block">
              <span className="font-body text-xs text-grey-label">{label}</span>
              <input type={type} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body focus:outline-none focus:border-primary" />
            </label>
          ))}
          <label className="block">
            <span className="font-body text-xs text-grey-label">Your message — what's on your mind?</span>
            <textarea rows={6} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body focus:outline-none focus:border-primary" />
          </label>
          <button type="submit" className="rounded-full bg-primary text-accent px-7 py-3 text-sm font-semibold">Send</button>
        </form>

        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-border p-6 bg-secondary/40">
            <Mail size={20} className="text-primary mb-3" />
            <p className="font-display text-lg text-primary">hello@myraaha.com</p>
            <p className="font-body text-xs text-grey-meta mt-1">For all inquiries.</p>
          </div>
          {[
            ["Become a Mentor", "Connect with users at relevant points in their journey. Be part of a network that takes the human dimension of career navigation seriously."],
            ["Partner With Us", "If you represent a school, college, corporate, NGO, or institution — we'd like to explore what that looks like together."],
            ["Support the Mission", "MyRaaha is non-profit by intent. The support of people who believe in this mission matters in our early stages."],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-border p-6">
              <p className="font-display text-lg text-primary">{t}</p>
              <p className="font-body text-sm text-foreground/75 mt-2 leading-relaxed">{b}</p>
            </div>
          ))}
        </aside>
      </div>
    </Section>

    <Section variant="muted" eyebrow="FAQ" title="Common questions.">
      <div className="space-y-4 max-w-3xl">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-2xl bg-background border border-border p-6 open:shadow-soft transition-shadow">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-6">
              <p className="font-display text-lg text-primary leading-snug">{q}</p>
              <span className="text-primary font-display text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
            </summary>
            <p className="font-body text-sm text-foreground/75 mt-4 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  </LandingLayout>
);

export default Contact;
