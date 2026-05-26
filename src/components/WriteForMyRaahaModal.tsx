import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, Send, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import './WriteForMyRaahaModal.css';

interface WriteForMyRaahaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WriteForMyRaahaModal = ({ isOpen, onClose }: WriteForMyRaahaModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !authorName || !excerpt || !content) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let coverImageUrl = '';

      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('insight-covers')
          .upload(fileName, coverImage, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error(`Cover image upload failed: ${uploadError.message}`);
        const { data } = supabase.storage.from('insight-covers').getPublicUrl(fileName);
        if (data) coverImageUrl = data.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase
        .from('insights_submissions')
        .insert([{
          title: title.trim(),
          category,
          author_name: authorName.trim(),
          author_title: authorTitle.trim() || null,
          excerpt: excerpt.trim(),
          content: content.trim(),
          cover_image_url: coverImageUrl || null,
          status: 'pending',
          user_id: user?.id ?? null,
        }]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      setTitle(''); setCategory(''); setAuthorName(''); setAuthorTitle('');
      setExcerpt(''); setContent(''); setCoverImage(null); setImagePreview(null);

      setTimeout(() => { setIsSuccess(false); onClose(); }, 3500);
    } catch (err: any) {
      console.error('Insights form submission error:', err);
      setErrorMsg(err.message || 'We encountered an error saving your draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    isOpen ? (
      <div
        className="write-modal-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="write-modal-container">
          <button className="write-modal-close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>

          {!isSuccess ? (
            <>
              <div className="write-modal-header">
                <h2>Publish on MyRaaha Insights</h2>
                <p>Share your perspective, research, or success story with our community of career navigators.</p>
              </div>

              <form className="write-modal-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Article Title *</label>
                    <input type="text" placeholder="e.g. The Future of AI in Career Navigation"
                      value={title} onChange={(e) => setTitle(e.target.value)}
                      disabled={isSubmitting} required />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting} required>
                      <option value="">Select a category</option>
                      <option value="Industry Analysis">Industry Analysis</option>
                      <option value="Success Stories">Success Stories</option>
                      <option value="Research">Research</option>
                      <option value="Events">Events</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author Name *</label>
                    <input type="text" placeholder="Your full name"
                      value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                      disabled={isSubmitting} required />
                  </div>
                  <div className="form-group">
                    <label>Author Title / Credentials</label>
                    <input type="text" placeholder="e.g. UX Designer / Educator"
                      value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)}
                      disabled={isSubmitting} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Brief Excerpt (Summary) *</label>
                  <textarea className="excerpt-input"
                    placeholder="A 2-3 sentence summary of your insight to display on the article cards..."
                    value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                    disabled={isSubmitting} required maxLength={250} />
                </div>

                <div className="form-group">
                  <label>Article Content *</label>
                  <textarea className="content-input"
                    placeholder="Write your article here. You can use markdown for headings, quotes, and lists..."
                    value={content} onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting} required />
                </div>

                <div className="form-group">
                  <label>Cover Image</label>
                  <div
                    className={`image-upload-zone ${imagePreview ? 'has-preview' : ''}`}
                    onClick={triggerFileInput}
                    style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                  >
                    {imagePreview ? (
                      <div style={{
                        width: '100%', height: '160px', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem', background: '#f8fafc',
                        border: '2px dashed var(--myraaha-blue)', borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
                          <img src={imagePreview} alt="Cover Preview"
                            style={{ width: '180px', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.95rem', wordBreak: 'break-all' }}>
                              {coverImage?.name}
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                              {coverImage ? `${(coverImage.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                            </p>
                          </div>
                        </div>
                        <button type="button" onClick={handleRemoveImage}
                          style={{
                            background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444',
                            padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={32} className="upload-icon" />
                        <span>Click to upload a cover image</span>
                        <p className="upload-hint">1200 x 600px recommended (JPG, PNG)</p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} className="file-hidden-input"
                      accept="image/*" onChange={handleFileChange}
                      style={{ display: 'none' }} disabled={isSubmitting} />
                  </div>
                </div>

                {errorMsg && (
                  <div className="write-modal-error" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: '#dc2626', fontSize: '0.9rem', fontWeight: 500,
                    marginBottom: '1rem', padding: '0.75rem',
                    background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2'
                  }}>
                    <AlertTriangle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="write-modal-footer">
                  <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-publish" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'} <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="write-modal-success">
              <div className="success-circle">
                <Check size={48} className="success-check-icon" />
              </div>
              <h2>Submission Received!</h2>
              <p>Thank you for contributing to the MyRaaha community. Our editorial team will review your insight and you will be notified once it is published.</p>
            </div>
          )}
        </div>
      </div>
    ) : null,
    document.body
  );
};

export default WriteForMyRaahaModal;
