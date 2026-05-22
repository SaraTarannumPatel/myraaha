import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Calendar, Check, Twitter, Linkedin, Link2,
  Bookmark, Heart, Instagram, Facebook, MessageCircle, PenTool
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import WriteForMyRaahaModal from '../components/WriteForMyRaahaModal';
import { insightsData, type InsightArticle } from '../data/insightsData';
import { supabase } from '@/integrations/supabase/client';
import './MyRaahaInsightsDetail.css';
import './MyRaahaLanding.css';

const MyRaahaInsightsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [post, setPost] = useState<InsightArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadPost = async () => {
      setIsLoading(true);
      if (slug && slug.startsWith('community-')) {
        try {
          const dbId = slug.substring('community-'.length);
          const { data, error } = await supabase
            .from('insights_submissions')
            .select('*')
            .eq('id', dbId)
            .eq('status', 'approved')
            .single();
          if (error) throw error;
          if (data) {
            const paragraphs = data.content
              .split('\n')
              .map((p: string) => p.trim())
              .filter((p: string) => p.length > 0)
              .map((text: string) => ({ type: 'p' as const, text }));
            setPost({
              slug: `community-${data.id}`,
              title: data.title,
              category: data.category as any,
              date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              excerpt: data.excerpt,
              image: data.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
              author: data.author_name + (data.author_title ? `, ${data.author_title}` : ''),
              readTime: `${Math.max(2, Math.ceil(data.content.split(/\s+/).length / 200))} min`,
              content: paragraphs,
              relatedReadingSlugs: [],
            });
          } else {
            setPost(null);
          }
        } catch (err) {
          console.error('Error fetching community article:', err);
          setPost(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        const staticPost = insightsData.find(item => item.slug === slug);
        setPost(staticPost || null);
        setIsLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) setScrollProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid var(--myraaha-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading perspective...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}` }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="insights-detail-not-found">
        <MyRaahaNavbar />
        <div className="not-found-container">
          <h2>Perspective not found</h2>
          <p>The insight or analysis you are looking for does not exist or has been relocated.</p>
          <Link to="/insights" className="btn-partner">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
          </Link>
        </div>
        <MyRaahaFooter />
      </div>
    );
  }

  const relatedPosts = post.relatedReadingSlugs && post.relatedReadingSlugs.length > 0
    ? insightsData.filter(item => post.relatedReadingSlugs!.includes(item.slug)).slice(0, 3)
    : insightsData.filter(item => item.slug !== slug).slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (liked) { setLiked(false); setLikesCount(c => c - 1); }
    else { setLiked(true); setLikesCount(c => c + 1); }
  };

  return (
    <div className="insights-detail-page">
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <MyRaahaNavbar />

      <main className="insight-main-content">
        <header className="insight-header-section">
          <div className="insight-header-container">
            <div className="insight-breadcrumbs">
              <div className="breadcrumb-left-group">
                <Link to="/insights" className="insight-back-link">
                  <ArrowLeft size={16} /> Perspectives
                </Link>
                <span className="insight-breadcrumb-separator">/</span>
                <span className="insight-current-breadcrumb">{post.category}</span>
              </div>
            </div>

            <h1 className="insight-title">
              {post.title.split(':').map((part, index) => (
                <span key={index}>{index === 0 ? part : <span className="insight-title-subtitle">: {part}</span>}</span>
              ))}
            </h1>

            <p className="insight-excerpt">{post.excerpt}</p>

            <div className="insight-top-meta-container">
              <div className="insight-author-meta">
                <div className="insight-author-avatar">{post.author.split(' ').map(n => n[0]).join('')}</div>
                <div className="insight-author-info">
                  <div className="insight-author-name">{post.author}</div>
                  <div className="insight-meta-stats">
                    <span><Calendar size={14} /> {post.date}</span>
                    <span className="insight-meta-dot">•</span>
                    <span><Clock size={14} /> {post.readTime} Read</span>
                  </div>
                </div>
              </div>

              <div className="insight-horizontal-toolbar">
                <div className="insight-interaction-group">
                  <button className={`insight-btn-action insight-btn-like ${liked ? 'active' : ''}`} onClick={handleLike}>
                    <Heart size={18} fill={liked ? '#ef4444' : 'transparent'} />
                    <span className="insight-action-count">{likesCount}</span>
                  </button>
                </div>
                <div className="insight-toolbar-divider"></div>
                <div className="insight-social-group">
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="insight-btn-social"><Linkedin size={18} /></a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="insight-btn-social"><Twitter size={18} /></a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="insight-btn-social"><Facebook size={18} /></a>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="insight-btn-social"><MessageCircle size={18} /></a>
                  <button className="insight-btn-social" onClick={handleCopyLink}>
                    {copied ? <Check size={18} className="success-icon" /> : <Link2 size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="insights-action-bar-hero" style={{ maxWidth: '1400px', margin: '2rem auto -1rem', padding: '0 2rem', display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
          <button onClick={() => setIsWriteModalOpen(true)} className="btn-partner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <PenTool size={18} /> Write for MyRaaha
          </button>
        </div>

        <div className="insight-featured-image-container">
          <img src={post.image} alt={post.title} className="insight-featured-image" />
        </div>

        <div className="insight-article-layout">
          <article className="insight-article-body">
            {post.content.map((block, idx) => {
              switch (block.type) {
                case 'h3': return <h3 key={idx} id={`heading-${idx}`} className="insight-h3">{block.text}</h3>;
                case 'h4': return <h4 key={idx} id={`heading-${idx}`} className="insight-h4">{block.text}</h4>;
                case 'p': return <p key={idx} className="insight-p">{block.text}</p>;
                case 'quote': return <blockquote key={idx} className="insight-quote"><p>{block.text}</p></blockquote>;
                case 'list':
                  return (
                    <ul key={idx} className="insight-list">
                      {block.items.map((item, i) => (
                        <li key={i}>
                          <span className="insight-list-marker"></span>
                          <span className="insight-list-text">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                default: return null;
              }
            })}
          </article>

          <aside className="insight-sidebar">
            <div className="insight-sticky-widgets">
              <div className="insight-widget insight-cta-widget">
                <div className="insight-cta-icon"><Bookmark size={24} /></div>
                <h4 className="insight-widget-title">Stay Updated</h4>
                <p>Get data-driven wisdom on career navigation and entrepreneurship directly in your inbox.</p>
                <form className="insight-sidebar-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to Insights newsletter!'); }}>
                  <input type="email" placeholder="Your email address" required className="insight-input-email" />
                  <button type="submit" className="insight-btn-subscribe">Subscribe</button>
                </form>
              </div>

              {relatedPosts.length > 0 && (
                <div className="insight-widget insight-related-sidebar-widget">
                  <h4 className="insight-widget-title">Continue Reading</h4>
                  <div className="insight-sidebar-related-list">
                    {relatedPosts.map((rp) => (
                      <Link to={`/insights/${rp.slug}`} key={rp.slug} className="insight-sidebar-related-card">
                        <div className="insight-sidebar-related-image">
                          <img src={rp.image} alt={rp.title} />
                        </div>
                        <div className="insight-sidebar-related-content">
                          <span className="insight-sidebar-related-meta">{rp.category} • {rp.readTime}</span>
                          <h5 className="insight-sidebar-related-title">{rp.title}</h5>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="insight-author-card-full">
          <div className="insight-author-card-content">
            <div className="insight-author-large-avatar">{post.author.split(' ').map(n => n[0]).join('')}</div>
            <div className="insight-author-bio">
              <h3>Written by {post.author}</h3>
              <p>Exploring the future of career transition, scaling mentorship ecosystems, and bridging the vocational skills gap in India. Dedicated to delivering data-driven solutions for builders and professionals.</p>
              <div className="insight-author-socials">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MyRaahaNewsletter />
      <MyRaahaFooter />

      <WriteForMyRaahaModal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} />
    </div>
  );
};

export default MyRaahaInsightsDetail;
