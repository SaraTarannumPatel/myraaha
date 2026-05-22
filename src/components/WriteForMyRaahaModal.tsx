import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertTriangle, PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['Industry Analysis', 'Success Stories', 'Research', 'Events'];

const WriteForMyRaahaModal = ({ isOpen, onClose }: Props) => {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author_name: '',
    author_title: '',
    author_email: '',
    cover_image_url: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content || !form.category || !form.author_name) {
      setErr('Please fill all required fields.');
      return;
    }
    setStatus('submitting');
    setErr('');
    try {
      const { error } = await supabase.from('insights_submissions').insert([{ ...form, status: 'pending' }]);
      if (error) throw error;
      setStatus('success');
    } catch (e: any) {
      setErr(e.message || 'Submission failed');
      setStatus('error');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, maxWidth: 640, width: '100%',
          maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16, background: '#f8fafc',
            border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Submission received</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Thanks for contributing. Our editors will review and publish if approved.
            </p>
            <button onClick={onClose} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
              <PenTool size={22} style={{ color: 'var(--myraaha-blue)' }} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Write for MyRaaha</h2>
            </div>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Share a perspective with our readers. We review every submission before publishing.
            </p>

            <form onSubmit={submit} style={{ display: 'grid', gap: '1.25rem' }}>
              {[
                { id: 'title', label: 'Title *', type: 'text' },
                { id: 'excerpt', label: 'Short excerpt *', type: 'text' },
                { id: 'author_name', label: 'Your name *', type: 'text' },
                { id: 'author_title', label: 'Your role / title', type: 'text' },
                { id: 'author_email', label: 'Your email', type: 'email' },
                { id: 'cover_image_url', label: 'Cover image URL (optional)', type: 'url' },
              ].map(f => (
                <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor={f.id} style={{ fontSize: '0.85rem', fontWeight: 600 }}>{f.label}</label>
                  <input
                    id={f.id} type={f.type}
                    value={(form as any)[f.id]} onChange={onChange}
                    disabled={status === 'submitting'}
                    style={{ padding: '0.85rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="category" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category *</label>
                <select
                  id="category" value={form.category} onChange={onChange}
                  disabled={status === 'submitting'}
                  style={{ padding: '0.85rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                >
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="content" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Article body * (separate paragraphs with new lines)</label>
                <textarea
                  id="content" rows={8} value={form.content} onChange={onChange}
                  disabled={status === 'submitting'}
                  style={{ padding: '0.85rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              {status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: '0.9rem' }}>
                  <AlertTriangle size={16} /> {err}
                </div>
              )}

              <button
                type="submit" disabled={status === 'submitting'}
                className="btn-primary"
                style={{ padding: '0.95rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {status === 'submitting' ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit for review'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WriteForMyRaahaModal;
