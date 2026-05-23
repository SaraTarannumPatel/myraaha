import React from 'react';
import { LucideIcon } from 'lucide-react';
import './StandardPageHero.css';

interface HeroFeature {
  icon: LucideIcon;
  label: string;
}

interface StandardPageHeroProps {
  badge: string;
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  features: HeroFeature[];
  className?: string;
}

const StandardPageHero: React.FC<StandardPageHeroProps> = ({ 
  badge, 
  title, 
  subtitle, 
  features,
  className = ""
}) => {
  return (
    <header className={`standard-page-hero ${className}`}>
      <span className="section-badge">{badge}</span>
      <h1 className="hero-title">
        {typeof title === 'string' ? (
          title.split(' ').map((word, i) => (
            <span key={i}>
              {i === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()}{' '}
            </span>
          ))
        ) : (
          title
        )}
      </h1>
      <p className="hero-subtitle" style={{ textAlign: 'center', width: '100%', margin: '0 auto' }}>
        {subtitle}
      </p>

      {features && features.length > 0 && (
        <div className="hero-features-standard">
          {features.map((feature, index) => (
            <div key={index} className="hero-feature-item">
              <feature.icon size={20} />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default StandardPageHero;
