import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Users, GraduationCap, Building2, Briefcase, Heart, BookOpen, Quote, Mail, Zap } from 'lucide-react';
const FadeInView = ({children}: {children: React.ReactNode}) => <>{children}</>;

export const ImpactSection = () => {
  const stats = [
    { label: "Lives Clarified", value: "100k+", icon: Users, desc: "Individuals who found their next path." },
    { label: "Tier 3 Reach", value: "42%", icon: Heart, desc: "Impact beyond metropolitan borders." },
    { label: "Outcome Success", value: "92%", icon: CheckCircle, desc: "Retained in their chosen direction." },
    { label: "Institutions", value: "150+", icon: Building2, desc: "Partners in building infrastructure." }
  ];

  return (
    <section className="bg-white px-6 md:px-12 lg:px-20 border-t border-remaining overflow-hidden relative" style={{ paddingTop: 'var(--section-spacing)', paddingBottom: 'var(--section-spacing)' }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-[1500px] mx-auto relative z-10">
        <FadeInView className="text-center max-w-3xl mx-auto mb-24">
          <span className="type-ui-meta bg-highlight text-primary px-4 py-2 rounded-full inline-flex items-center gap-2 mb-6">Our Impact</span>
          <h2 className="type-section-opener mb-8">
            The scale of <span>real clarity.</span>
          </h2>
          <p className="type-body-primary text-black/60">
            Guidance isn't effective unless it works for everyone, regardless of where they start. We measure success by the outcomes of our travelers.
          </p>
        </FadeInView>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <FadeInView key={idx} delay={idx * 100}>
              <div className="bg-white border border-remaining p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-highlight transition-colors">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="type-hero text-primary mb-2">{stat.value}</div>
                <div className="type-h3 italic text-black mb-4">{stat.label}</div>
                <p className="type-ui-meta opacity-40">{stat.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
};

export const SuccessStoriesSection = () => {
  const [activeTab, setActiveTab] = useState('College Students');

  const categories = [
    { id: 'School Students', icon: BookOpen },
    { id: 'College Students', icon: GraduationCap },
    { id: 'Parents', icon: Heart },
    { id: 'Job Seekers', icon: Briefcase },
    { id: 'Career Transitioners', icon: ArrowRight },
    { id: 'Schools', icon: Building2 },
    { id: 'Colleges', icon: Building2 },
    { id: 'Universities', icon: Building2 }
  ];

  const stories: Record<string, any[]> = {
    'School Students': [
      { name: "Aryan V.", role: "11th Grade, Bhopal", story: "I was choosing between JEE and Design based on peer pressure. Myraaha helped me see that my spatial logic scores favored architecture, saving me years of mismatch.", pivot: "Engineering → Architecture" },
      { name: "Sanya K.", role: "12th Grade, Nashik", story: "The simulation showed me the day-to-day reality of law vs journalism. I realized I loved the research but hated the litigation. Now I'm pursuing Policy Research.", pivot: "Law → Public Policy" }
    ],
    'College Students': [
      { name: "Rahul M.", role: "Final Year B.Tech", story: "Everyone was running for IT jobs. My behavioral graph showed high aptitude for systems thinking but low interest in pure coding. Myraaha guided me toward Product Management.", pivot: "Developer → Product Manager" },
      { name: "Ananya S.", role: "MBA Aspirant", story: "I was doing an MBA just because it was 'safe'. Myraaha identified my deep creative articulation and steered me toward Creative Strategy for startups.", pivot: "General Mgmt → Brand Strategy" }
    ],
    'Parents': [
      { name: "Mrs. Gupta", role: "Parent of 10th Grader", story: "I wanted my son to do Medicine. Myraaha's report showed me his cognitive strengths in logical reasoning and abstract patterns. We finally understood why he struggled with biology.", pivot: "Medicine → Data Science" }
    ],
    'Job Seekers': [
      { name: "Vikram J.", role: "Entry-level professional", story: "After 6 months of rejection, Myraaha helped me re-articulate my 'hidden' skills in communication. I secured a role in 3 weeks by targeting the right alignment.", pivot: "Unemployed → Sales Strategy" }
    ],
    'Career Transitioners': [
      { name: "Priya R.", role: "Ex-Banker", story: "10 years in banking left me drained. Myraaha mapped my financial logic to Fintech Product design. I didn't lose my experience; I repurposed it.", pivot: "Banking → Fintech Design" }
    ],
    'Schools': [
      { name: "St. Xavier's", role: "Partner Institution", story: "We reduced career choice anxiety in our senior secondary batch by 65% through the simulation modules.", pivot: "Reduced Anxiety" }
    ],
    'Colleges': [
      { name: "LMN Institute", role: "Engineering Partner", story: "Placement alignment improved. Students are now choosing roles where they actually stay longer than 6 months.", pivot: "Improved Retention" }
    ],
    'Universities': [
      { name: "National University", role: "System Partner", story: "Integrating SelfGraph into our student portal allowed us to provide personalized mentorship at scale to 5,000+ students.", pivot: "Scale Personalized Guidance" }
    ]
  };

  return (
    <section className="bg-primary/5 px-6 md:px-12 lg:px-20 border-y border-remaining relative overflow-hidden" style={{ paddingTop: 'var(--section-spacing)', paddingBottom: 'var(--section-spacing)' }}>
      <div className="absolute inset-0 bg-grid-black/[0.02] pointer-events-none" />
      
      <div className="max-w-[1500px] mx-auto relative z-10">
        <FadeInView className="text-center max-w-3xl mx-auto mb-20">
          <span className="type-ui-meta bg-highlight text-primary px-4 py-2 rounded-full inline-flex items-center gap-2 mb-6">Success Stories</span>
          <h2 className="type-section-opener mb-8">
            Journeys of <span>alignment.</span>
          </h2>
          <p className="type-body-primary text-black/60">
            Real stories from travelers who moved from confusion to precision.
          </p>
        </FadeInView>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-8 gap-4 no-scrollbar justify-start md:justify-center mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-8 py-4 rounded-full border transition-all shrink-0 flex items-center gap-3 type-ui-button
                ${activeTab === cat.id 
                  ? 'bg-primary text-highlight border-primary shadow-xl scale-105' 
                  : 'bg-white text-black/60 border-remaining hover:border-primary/30'}`}
            >
              <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? 'text-highlight' : 'text-primary'}`} />
              {cat.id}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 min-h-[400px]">
          {stories[activeTab]?.map((story, idx) => (
            <FadeInView key={`${activeTab}-${idx}`} delay={idx * 50} className="h-full">
              <div className="bg-white border border-remaining p-10 md:p-14 rounded-[48px] shadow-sm hover:shadow-2xl transition-all flex flex-col h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Quote className="w-24 h-24" />
                </div>
                
                <div className="flex-1">
                  <div className="type-ui-meta text-primary bg-highlight px-4 py-1 rounded-full w-fit mb-8">{story.pivot}</div>
                  <p className="type-body-long text-black opacity-80 mb-12 italic">
                    "{story.story}"
                  </p>
                </div>

                <div className="pt-10 border-t border-remaining flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary type-h3">
                    {story.name[0]}
                  </div>
                  <div>
                    <h4 className="type-h3 text-black">{story.name}</h4>
                    <p className="type-ui-meta opacity-40">{story.role}</p>
                  </div>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
};

export const NewsletterSection = () => {
  return (
    <section className="px-6 md:px-12 lg:px-20 bg-white border-t border-remaining" style={{ paddingTop: 'var(--section-spacing)', paddingBottom: 'var(--section-spacing)' }}>
      <div className="max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-center">
          <div className="lg:col-span-7">
            <FadeInView>
              <span className="type-ui-meta bg-highlight text-primary px-4 py-2 rounded-full inline-flex items-center gap-2 mb-10">Stay updated</span>
              <h2 className="type-hero mb-10">
                Weekly clarity, <br />
                <span>straight to your inbox.</span>
              </h2>
              <p className="type-body-primary text-black opacity-60 max-w-xl mb-16">
                Join 15,000+ others navigating the chaos with precision. We send one email a week. No noise. No hype. Just frameworks and stories that matter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 max-w-2xl">
                <div className="flex-1 relative group">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="w-full bg-white border-b-2 border-remaining px-2 py-6 focus:outline-none focus:border-primary transition-colors type-body-primary placeholder:opacity-20"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
                <button className="bg-primary text-highlight px-12 py-6 rounded-full hover:scale-105 transition-all shadow-xl type-ui-button flex items-center justify-center gap-4 group">
                  Join the list
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
              <p className="type-ui-meta mt-10 opacity-20 italic">By subscribing, you agree to our privacy policy. Unsubscribe anytime.</p>
            </FadeInView>
          </div>
          
          <div className="lg:col-span-5">
            <FadeInView delay={200}>
              <div className="bg-primary/5 p-12 md:p-16 rounded-[60px] border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-highlight opacity-20 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="relative z-10 space-y-12">
                   <div className="flex gap-8 items-start">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                       <Zap className="w-7 h-7" />
                     </div>
                     <div>
                       <h4 className="type-h3 text-primary italic mb-2">Decision <span>models</span></h4>
                       <p className="type-ui-meta opacity-40">Practical frameworks to resolve hesitation.</p>
                     </div>
                   </div>
                   <div className="flex gap-8 items-start">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                       <Users className="w-7 h-7" />
                     </div>
                     <div>
                       <h4 className="type-h3 text-primary italic mb-2">Pivoting <span>stories</span></h4>
                       <p className="type-ui-meta opacity-40">Deep dives into successful transitions.</p>
                     </div>
                   </div>
                   <div className="flex gap-8 items-start">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                       <BookOpen className="w-7 h-7" />
                     </div>
                     <div>
                       <h4 className="type-h3 text-primary italic mb-2">System <span>updates</span></h4>
                       <p className="type-ui-meta opacity-40">The latest in navigation infrastructure.</p>
                     </div>
                   </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
};
