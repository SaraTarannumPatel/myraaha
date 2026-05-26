import { useEffect } from 'react';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import StandardPageHero from '../../components/StandardPageHero';
import '../MyRaahaAbout.css';

const sections = [
  { h: 'What we collect', b: "Account basics (name, email, phone), the things you tell our tools (compass answers, journal entries, mood check-ins), and standard product analytics so we can keep MyRaaha working." },
  { h: 'Why we collect it', b: 'To personalize your roadmap and recommendations, to keep your account secure, and to improve the product. We do not sell your data.' },
  { h: 'Who can see what', b: 'By default, your reflections are private to you. Mentors and peer circles only see what you explicitly share, when you share it.' },
  { h: 'Your controls', b: 'Export, edit, or delete your data anytime from Settings. You can revoke any sharing or integration with one click.' },
  { h: 'Retention', b: 'We keep your data while your account is active. When you delete your account, your personal data is removed within 30 days.' },
  { h: 'Children & youth', b: 'MyRaaha is open to users 13+. For users under 18, we apply stricter defaults and minimize data collection.' },
  { h: 'Contact', b: 'Privacy questions: privacy@myraaha.org. We respond within 7 working days.' },
];

const Privacy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="myraaha-about-page">
      <MyRaahaNavbar />
      <StandardPageHero
        badge="Privacy Policy"
        title={<>Your data, <span className="italic">your terms.</span></>}
        subtitle="MyRaaha is consent-first. This page explains, in plain language, what we collect, why, and how you stay in control."
        features={[]}
      />
      <section style={{ padding: '5rem 1.5rem', maxWidth: 820, margin: '0 auto' }}>
        {sections.map(s => (
          <article key={s.h} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.25rem', fontFamily: 'Poppins, sans-serif' }}>
            <h3 style={{ color: 'var(--myraaha-blue, #5500CB)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.h}</h3>
            <p style={{ color: '#475569', lineHeight: 1.7 }}>{s.b}</p>
          </article>
        ))}
        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#94a3b8', fontSize: '0.9rem', marginTop: '1rem' }}>Last updated: May 2026</p>
      </section>
      <MyRaahaFooter />
    </div>
  );
};

export default Privacy;
