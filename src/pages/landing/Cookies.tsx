import { useEffect } from 'react';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import StandardPageHero from '../../components/StandardPageHero';
import '../MyRaahaAbout.css';

const cookies = [
  { name: 'Essential', purpose: 'Authentication, session, security. These cannot be turned off.', retention: 'Session / 30 days' },
  { name: 'Functional', purpose: 'Remembering your preferences and saved state across visits.', retention: 'Up to 12 months' },
  { name: 'Analytics', purpose: 'Anonymous usage analytics to help us improve the product.', retention: 'Up to 14 months' },
];

const Cookies = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="myraaha-about-page">
      <MyRaahaNavbar />
      <StandardPageHero
        badge="Cookie Policy"
        title={<>The cookies we use — <span className="italic">and why.</span></>}
        subtitle="A short, jargon-free breakdown of how MyRaaha uses cookies and similar technologies."
        features={[]}
      />
      <section style={{ padding: '5rem 1.5rem', maxWidth: 820, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>Type</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>Purpose</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>Retention</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map(c => (
                <tr key={c.name} style={{ borderTop: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                  <td style={{ padding: '1rem', color: 'var(--myraaha-blue, #5500CB)', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{c.purpose}</td>
                  <td style={{ padding: '1rem', color: '#94a3b8' }}>{c.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: '#475569', marginTop: '1.5rem', lineHeight: 1.7 }}>
          You can manage non-essential cookies anytime in Settings, or via your browser's privacy controls.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1rem' }}>Last updated: May 2026</p>
      </section>
      <MyRaahaFooter />
    </div>
  );
};

export default Cookies;
