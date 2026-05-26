import { useState } from 'react';
import { Send, User, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import './MyRaahaNewsletter.css';

const MyRaahaNewsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setFeedbackMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email: email.trim().toLowerCase(), user_id: user?.id ?? null }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          setFeedbackMsg('You are already subscribed! Thank you for staying connected.');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setFeedbackMsg('Thank you! You have successfully subscribed to Weekly Insights.');
        setEmail('');
      }
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      setFeedbackMsg(err.message || 'Unable to subscribe right now. Please try again.');
    }
  };

  return (
    <section className="myraaha-newsletter-v3">
      <div className="n-v3-container">
        <div className="n-v3-visual-side">
          <div className="n-v3-image-wrapper">
            <img src="/newsletter_insights.png" alt="Weekly Insights" />
            <div className="n-v3-overlay"></div>
            <div className="n-v3-floating-circles">
              <div className="n-v3-circle n-v3-circle-1"><User size={16} /></div>
              <div className="n-v3-circle n-v3-circle-2"><User size={14} /></div>
              <div className="n-v3-circle n-v3-circle-3"><User size={12} /></div>
            </div>
          </div>
          <div className="n-v3-social-proof">
            <p>Join the MyRaaha community of career navigators</p>
          </div>
        </div>

        <div className="n-v3-content-side">
          <div className="n-v3-header">
            <span className="n-v3-badge">Weekly Insights</span>
            <h2 className="n-v3-title">Stay ahead of the <br /><span>future of education.</span></h2>
            <p className="n-v3-subtitle">
              Get curated insights on career evolution, NEP 2020 transitions, and exclusive
              ecosystem opportunities delivered every Monday.
            </p>
          </div>

          {status === 'success' ? (
            <div className="n-v3-success-box" style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              background: '#ecfdf5', border: '1px solid #10b981',
              padding: '1.25rem', borderRadius: '16px', color: '#065f46',
              maxWidth: '500px', marginTop: '1rem', animation: 'fadeIn 0.5s ease-out'
            }}>
              <Check className="w-6 h-6 text-emerald-600" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>{feedbackMsg}</p>
            </div>
          ) : (
            <form className="n-v3-form" onSubmit={handleSubscribe}>
              <div className="n-v3-input-group">
                <input
                  type="email"
                  placeholder="Your professional email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'submitting'}
                  required
                />
                <button
                  type="submit"
                  className="n-v3-btn"
                  style={{ background: 'var(--myraaha-blue-dark)', color: 'white' }}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <><span>Submitting</span><Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : (
                    <><span>Subscribe</span><Send className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              {status === 'error' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#dc2626', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 500
                }}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <p className="n-v3-privacy">No spam. Just value. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyRaahaNewsletter;
