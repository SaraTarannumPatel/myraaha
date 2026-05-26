import { useEffect } from 'react';
import { Cookie, Info, ShieldCheck, Zap } from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import './MyRaahaLegal.css';

const MyRaahaCookies = () => {

  const sections = [
    { id: 'definition', label: 'What are cookies?' },
    { id: 'usage', label: 'How we use them' },
    { id: 'types', label: 'Cookie types' },
    { id: 'third-party', label: 'Third parties' },
    { id: 'management', label: 'Managing choices' }
  ];


};

export default MyRaahaCookies;
