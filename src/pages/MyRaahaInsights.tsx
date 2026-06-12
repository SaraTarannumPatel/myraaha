import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight,
  TrendingUp,
  BookOpen,
  Target,
  PenTool
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import './MyRaahaInsights.css';
import './MyRaahaLanding.css';
import StandardPageHero from '../components/StandardPageHero';
import WriteForMyRaahaModal from '../components/WriteForMyRaahaModal';
import { insightsData } from '../data/insightsData';

const MyRaahaInsights = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    return sessionStorage.getItem('myraaha_active_category') || 'All';
  });

  useEffect(() => {
    sessionStorage.setItem('myraaha_active_category', activeCategory);
  }, [activeCategory]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Fetch approved user submissions from Supabase
  useEffect(() => {
    const fetchApprovedInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('public_insights' as any)
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted = data.map(item => ({
            slug: `community-${item.id}`,
            title: item.title,
            category: item.category,
            date: new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
            excerpt: item.excerpt,
            image: item.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            isUserSubmitted: true
          }));
          setDbArticles(formatted);
        }
      } catch (err) {
        console.warn('Fallback to static data. Error fetching community insights:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedInsights();
  }, []);

  // Get lead post for the featured banner
  const featuredPost = insightsData.find(post => post.slug === 'the-career-guidance-gap') || insightsData[0];

  // Merge static posts with approved database posts
  const allArticles = [...dbArticles, ...insightsData];

  // Filter articles based on selected tab
  const filteredArticles = activeCategory === 'All'
    ? allArticles
    : allArticles.filter(article => article.category === activeCategory);

  const categories = [
    { label: 'All insights', value: 'All' },
    { label: 'Industry analysis', value: 'Industry Analysis' },
    { label: 'Success stories', value: 'Success Stories' },
    { label: 'Research', value: 'Research' },
    { label: 'Events', value: 'Events' }
  ];

  return (
    <div className="insights-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Knowledge Hub"
        title={
          <>
            Latest <span>perspectives</span> on innovation
          </>
        }
        subtitle="Exploring the intersections of academia, industry, and social impact through our latest research, news, and success stories."
        features={[]}
      >
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setIsWriteModalOpen(true)}
            className="btn-partner"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PenTool size={18} /> Write for MyRaaha
          </button>
        </div>
      </StandardPageHero>

      {/* Featured Insight */}
      <section className="insights-featured">
        <div className="featured-card">
          <div className="featured-img-box">
            <img src={featuredPost.image} alt={featuredPost.title} />
          </div>
          <div className="featured-content">
            <span className="featured-category">Featured analysis</span>
            <h2>The Career Guidance Gap: Why India's Navigation System is Structurally <span>Broken</span></h2>
            <p>{featuredPost.excerpt}</p>
            <Link to={`/insights/${featuredPost.slug}`} className="btn-partner read-article-btn">Read full analysis</Link>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="insights-grid-section">
        <div className="grid-filters">
          {categories.map(cat => (
            <button 
              key={cat.value} 
              className={`filter-btn ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="insights-grid">
          {filteredArticles.map((article) => (
            <div 
              key={article.slug} 
              className="insight-card"
              onClick={() => navigate(`/insights/${article.slug}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="insight-img-box">
                <img src={article.image} alt={article.title} />
              </div>
              <div className="insight-card-content">
                <div className="insight-meta">
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h3>
                  {article.title.split(' ').slice(0, -1).join(' ')}{' '}
                  <span>{article.title.split(' ').slice(-1)[0]}</span>
                </h3>
                <p>{article.excerpt}</p>
                <Link to={`/insights/${article.slug}`} className="read-more" onClick={(e) => e.stopPropagation()}>
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MyRaahaNewsletter />

      <MyRaahaFooter />

      {/* Community Contribution Modal */}
      <WriteForMyRaahaModal 
        isOpen={isWriteModalOpen} 
        onClose={() => setIsWriteModalOpen(false)} 
      />
    </div>
  );
};

export default MyRaahaInsights;
