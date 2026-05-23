import { useEffect } from 'react';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../../components/MyRaahaNewsletter';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import StandardPageHero from '../../components/StandardPageHero';
import './MobileLegal.css';

interface MobileLegalProps {
  badge: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  content: React.ReactNode;
}

const MobileLegal: React.FC<MobileLegalProps> = ({ badge, title, subtitle, content }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mobile-legal-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge={badge}
        title={title}
        subtitle={subtitle}
        features={[]}
      />

      <section className="mobile-legal-content">
        {content}
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MobileLegal;
