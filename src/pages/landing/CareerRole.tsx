import { Link, useParams } from "react-router-dom";
import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";
import { getRoleBySlug, careerRoles } from "@/data/careersData";

const CareerRolePage = () => {
  const { slug = "" } = useParams();
  const role = getRoleBySlug(slug);

  if (!role) {
    return (
      <LandingLayout>
        <Section
          eyebrow="Careers"
          title="Role not found"
          lead="The role you were looking for isn't open right now."
        >
          <div className="flex flex-wrap gap-3">
            {careerRoles.map((r) => (
              <Link
                key={r.slug}
                to={`/careers-info/${r.slug}`}
                className="pill-chip hover:bg-primary hover:text-accent transition-colors"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </Section>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <PageHero
        eyebrow={`Careers · ${role.type}`}
        title={<>{role.title} <span className="highlight-mark italic">at MyRaaha</span></>}
        intro={role.summary}
        illustration={role.image}
        illustrationAlt={`${role.title} role at MyRaaha`}
      />

      <Section>
        <div className="grid lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 rounded-2xl border border-border p-6 h-fit space-y-4">
            <Meta label="Type" value={role.type} />
            <Meta label="Location" value={role.location} />
            <Meta label="Commitment" value={role.commitment} />
            <Link
              to="/contact"
              className="inline-flex w-full justify-center items-center rounded-full bg-primary text-accent px-6 py-3 text-sm font-semibold shadow-accent hover:opacity-90 transition"
            >
              Apply for this role
            </Link>
          </aside>

          <div className="lg:col-span-2 space-y-10">
            <Block title="What you'll do" items={role.responsibilities} />
            <Block title="What we look for" items={role.qualifications} />
            <Block title="What you get" items={role.benefits} />
          </div>
        </div>
      </Section>

      <CTABand
        title="See all open roles"
        primaryLabel="Back to Careers"
        primaryTo="/careers-info"
      />
    </LandingLayout>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-body text-xs uppercase tracking-[0.18em] text-grey-label">{label}</p>
    <p className="font-display text-lg text-primary mt-1">{value}</p>
  </div>
);

const Block = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className="font-display text-2xl sm:text-3xl text-primary mb-4">{title}</h3>
    <ul className="space-y-3">
      {items.map((i) => (
        <li
          key={i}
          className="font-body text-base text-foreground/80 leading-relaxed pl-5 relative"
        >
          <span className="absolute left-0 top-2 w-2 h-2 rounded-full bg-accent" />
          {i}
        </li>
      ))}
    </ul>
  </div>
);

export default CareerRolePage;
