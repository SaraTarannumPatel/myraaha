import { useEffect, useState } from 'react';
import {
  Globe, Linkedin, Twitter, Facebook, Mail, Send, Instagram,
  CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import { supabase } from '@/integrations/supabase/client';
import './MyRaahaLanding.css';
import './MyRaahaContact.css';

const MyRaahaContact = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [formData, setFormData] = useState({ name: '', email: '', type: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.type || !formData.message) {
      setErrorMsg('Please fill in all required fields.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('contact_submissions').insert([{
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        type: formData.type,
        message: formData.message.trim(),
      }]);
      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', email: '', type: '', message: '' });
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'We encountered an error sending your message. Please try again.');
    }
  };

  const faqs = [
    { question: 'What is <span>MyRaaha?</span>', answer: 'MyRaaha is an empathetic navigation system designed to scale career and entrepreneurship guidance through data-driven insights.' },
    { question: 'Who can benefit from <span>MyRaaha?</span>', answer: 'Students, early professionals, and aspiring founders seeking structural clarity and localized guidance across Bharat.' },
    { question: 'Is the platform <span>free?</span>', answer: 'We are non-profit by intent and revenue-first by design, ensuring accessibility for all while maintaining institutional sustainability.' },
    { question: 'How do partnerships <span>work?</span>', answer: 'We co-design programs with institutions. Reach out using the form above and select Strategic Partnership.' },
  ];

  return (
    <div className="contact-standard-v4">
      <MyRaahaNavbar />

      <StandardPageHero
        badge="Contact Us"
        title={<>Get in <span>touch</span></>}
        subtitle="Have a question or want to collaborate? We'd love to hear from you."
        features={[]}
      />

      <section className="contact-v4-main">
        <div className="v4-blob"></div>
        <div className="v4-container">
          <div className="contact-v4-grid">

            <div className="v4-form-card">
              {status === 'success' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CheckCircle size={44} style={{ color: '#10b981' }} />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Message <span>Received!</span></h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--myraaha-text-gray)', maxWidth: 400, lineHeight: 1.6, marginBottom: '2rem' }}>
                    Thank you for reaching out. We have logged your request in our system and our team will get back to you shortly.
                  </p>
                  <button onClick={() => setStatus('idle')} className="btn-primary v4-submit-btn" style={{ width: 'auto', padding: '0.8rem 2rem' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="v4-form-header">
                    <span className="section-badge">Direct Line</span>
                    <h2>Send us a <span>message</span></h2>
                    <p>We are here to help you navigate your career and impact journey.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="v4-contact-form">
                    <div className="v4-form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" placeholder="E.g. John Doe" value={formData.name} onChange={handleInputChange} disabled={status === 'submitting'} required />
                    </div>

                    <div className="v4-form-group">
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} disabled={status === 'submitting'} required />
                    </div>

                    <div className="v4-form-group full-width">
                      <label htmlFor="type">How can we help?</label>
                      <select id="type" value={formData.type} onChange={handleInputChange} disabled={status === 'submitting'} required>
                        <option value="">Select an option</option>
                        <option value="general">General Inquiry</option>
                        <option value="partnership">Strategic Partnership</option>
                        <option value="incubation">Venture Incubation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="v4-form-group full-width">
                      <label htmlFor="message">Your Message</label>
                      <textarea id="message" rows={5} placeholder="Tell us about your goals..." value={formData.message} onChange={handleInputChange} disabled={status === 'submitting'} required />
                    </div>

                    {status === 'error' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.9rem', fontWeight: 500, gridColumn: 'span 2', marginBottom: '1rem' }}>
                        <AlertTriangle size={18} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button type="submit" className="btn-primary v4-submit-btn" disabled={status === 'submitting'}>
                      {status === 'submitting' ? (
                        <>Sending Message... <Loader2 className="w-4 h-4 animate-spin" /></>
                      ) : (
                        <>Send Message <Send className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="v4-context-col">
              <div className="context-card">
                <div className="context-header">
                  <div className="context-icon"><Mail /></div>
                  <h3>Quick <span>Connect</span></h3>
                </div>
                <div className="context-content">
                  <a href="mailto:contact@myraaha.org" className="context-pill">contact@myraaha.org</a>
                  <a href="tel:+916360287699" className="context-pill">+91 63602 87699</a>
                </div>
              </div>

              <div className="context-card">
                <div className="context-header">
                  <div className="context-icon"><Globe /></div>
                  <h3>Our <span>Presence</span></h3>
                </div>
                <div className="context-content">
                  <div className="social-strip">
                    <a href="https://www.linkedin.com/company/myraaha/about" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><Linkedin /></a>
                    <a href="https://www.instagram.com/myraaha" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><Instagram /></a>
                    <a href="https://x.com/myraahaorg" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><Twitter /></a>
                    <a href="https://www.facebook.com/people/MyRaaha-Foundation/61589707157375/" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><Facebook /></a>
                    <a href="mailto:contact@myraaha.org" className="social-icon-btn" aria-label="Mail"><Mail /></a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="contact-v4-faq">
        <div className="v4-container">
          <div className="section-header">
            <span className="section-badge">Common Questions</span>
            <h2 className="section-title">We have <span>answers</span></h2>
          </div>

          <div className="faq-v4-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-card-modern">
                <h3 dangerouslySetInnerHTML={{ __html: faq.question }}></h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaContact;
