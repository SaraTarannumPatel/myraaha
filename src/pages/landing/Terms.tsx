import { useEffect } from 'react';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import StandardPageHero from '../../components/StandardPageHero';
import '../MyRaahaAbout.css';

const sections = [
  { h: '1. Using MyRaaha', b: "MyRaaha is a career and entrepreneurship guidance platform. By creating an account, you agree to use it lawfully and not to misuse, scrape, or attempt to disrupt the service." },
  { h: '2. Your account', b: "You're responsible for keeping your credentials safe. Notify us immediately of any unauthorized access." },
  { h: '3. Content you create', b: 'You own what you write inside MyRaaha (reflections, journals, plans). You grant us a limited license to process it solely to power your personalized experience.' },
  { h: '4. AI outputs', b: 'Recommendations and AI responses are informational. They are not professional financial, legal, medical, or mental-health advice.' },
  { h: '5. Payments', b: 'If you purchase a paid plan, billing terms are shown at checkout. Refunds are handled per our refund policy.' },
  { h: '6. Termination', b: 'You can delete your account at any time. We may suspend accounts that violate these terms.' },
  { h: '7. Liability', b: "MyRaaha is provided 'as is'. To the maximum extent permitted by law, we are not liable for indirect or consequential damages." },
  { h: '8. Governing law', b: 'These terms are governed by the laws of India. Disputes will be resolved in the courts of Bengaluru, Karnataka.' },
];

const Terms = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="myraaha-about-page">
      <MyRaahaNavbar />
      <StandardPageHero
        badge="Terms of Use"
        title={<>The rules of the road — <span className="italic">in plain words.</span></>}
        subtitle="These terms explain what you can expect from MyRaaha and what we ask of you in return."
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

export default Terms;
