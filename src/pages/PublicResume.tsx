import { useMemo } from 'react';
import { useParams, Navigate, Link as RouterLink } from 'react-router-dom';
import { Eye, Shield, ArrowLeft, Globe, Lock } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import MobilePublicResume from './mobile/MobilePublicResume';

type PublicResumePayload = {
  resume: any;
  sharingSettings?: any;
  privacySettings?: any;
  contextualNotes?: Record<string, string>;
  metadata?: {
    createdAt?: string;
    publishedAt?: string;
    updatedAt?: string;
    publishedByUserId?: string;
  };
};

export default function PublicResume(): JSX.Element {
  const isMobile = useMobile();
  const params = useParams();
  const publicId = params.publicId;

  const payload = useMemo(() => {
    if (!publicId) return null;
    try {
      const raw = localStorage.getItem(`shuttlex_public_resume_${publicId}`);
      if (!raw) return null;
      return JSON.parse(raw) as PublicResumePayload;
    } catch {
      return null;
    }
  }, [publicId]);

  if (!publicId) return <Navigate to="/" replace />;

  if (!payload) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gray-700" />
            <h1 className="type-h4 text-gray-900">Public resume not found</h1>
          </div>
          <p className="type-ui-meta text-gray-600">This public profile is not available on this device/browser, or it was unpublished.</p>
          <div className="mt-4">
            <RouterLink to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </RouterLink>
          </div>
        </div>
      </div>
    );
  }

  const resume = payload.resume || {};
  const notes = payload.contextualNotes || {};
  const privacy = payload.privacySettings || {};

  const showNotes = Object.keys(notes).length > 0;

  if (isMobile) {
    return <MobilePublicResume resume={resume} payload={payload} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Globe className="h-4 w-4" />
                <span>Public living resume</span>
              </div>
              <h1 className="type-h2 text-gray-900">{resume.name || 'Living resume'}</h1>
              {resume.headline ? <div className="type-body-primary text-gray-700 mt-1">{resume.headline}</div> : null}
              {resume.summary ? <p className="type-ui-meta text-gray-600 mt-3">{resume.summary}</p> : null}
              {payload.metadata?.publishedAt ? (
                <div className="text-xs text-gray-500 mt-3">Published: {new Date(payload.metadata.publishedAt).toLocaleString()}</div>
              ) : null}
            </div>
            <RouterLink
              to="/jobs/living-resume"
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg type-ui-button text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </RouterLink>
          </div>
        </div>

        {Array.isArray(resume.skills) && resume.skills.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="type-h3 text-gray-900 mb-4">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resume.skills.map((s: any, idx: number) => (
                <div key={`${s.name || 'skill'}_${idx}`} className="border border-gray-200 rounded-lg p-3">
                  <div className="type-ui-label text-gray-900">{s.name}</div>
                  <div className="type-ui-meta text-gray-600">{s.level} • {s.evidenceCount ?? 0} evidence</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {Array.isArray(resume.projects) && resume.projects.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="type-h3 text-gray-900 mb-4">Projects</h2>
            <div className="space-y-3">
              {resume.projects.map((p: any, idx: number) => (
                <div key={`${p.title || 'project'}_${idx}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="type-ui-label text-gray-900">{p.title}</div>
                  {p.role ? <div className="type-ui-meta text-gray-600 mt-1">Role: {p.role}</div> : null}
                  {p.outcome ? <div className="type-body-primary text-gray-700 mt-2">{p.outcome}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {Array.isArray(resume.courses) && resume.courses.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="type-h3 text-gray-900 mb-4">Learning</h2>
            <div className="space-y-3">
              {resume.courses.map((c: any, idx: number) => (
                <div key={`${c.title || 'course'}_${idx}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="type-ui-label text-gray-900">{c.title}</div>
                  <div className="type-ui-meta text-gray-600 mt-1">{c.provider || 'ShuttlEx'} • {c.status}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {Array.isArray(resume.achievements) && resume.achievements.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="type-h3 text-gray-900 mb-4">Achievements</h2>
            <div className="space-y-3">
              {resume.achievements.map((a: any, idx: number) => (
                <div key={`${a.title || 'achievement'}_${idx}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="type-ui-label text-gray-900">{a.title}</div>
                  {a.description ? <div className="type-body-primary text-gray-700 mt-2">{a.description}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {privacy?.showReflections && Array.isArray(resume.reflections) && resume.reflections.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-gray-700" />
              <h2 className="type-h3 text-gray-900">Reflections</h2>
            </div>
            <div className="space-y-3">
              {resume.reflections.map((r: any, idx: number) => (
                <div key={`${r.createdAt || 'reflection'}_${idx}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="type-body-primary text-gray-800">{r.text}</div>
                  {r.createdAt ? <div className="type-ui-meta text-gray-500 mt-2">{new Date(r.createdAt).toLocaleString()}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {privacy?.showNetworking && resume.networking ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-gray-700" />
              <h2 className="type-h3 text-gray-900">Networking</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Mentors</div>
                {Array.isArray(resume.networking.mentors) && resume.networking.mentors.length > 0 ? (
                  <div className="space-y-2">
                    {resume.networking.mentors.map((m: any, idx: number) => (
                      <div key={`${m.name || 'mentor'}_${idx}`} className="type-body-primary text-gray-700">
                        <div className="type-ui-label">{m.name}</div>
                        {m.topic ? <div className="type-ui-meta text-gray-500">{m.topic}</div> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No mentor activity shared</div>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Peer feedback</div>
                {Array.isArray(resume.networking.peerFeedback) && resume.networking.peerFeedback.length > 0 ? (
                  <div className="space-y-2">
                    {resume.networking.peerFeedback.map((p: any, idx: number) => (
                      <div key={`${p.from || 'peer'}_${idx}`} className="type-body-primary text-gray-700">
                        <div className="type-ui-label">{p.from}</div>
                        <div className="type-ui-meta text-gray-600">{p.feedback}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No peer feedback shared</div>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Contributions</div>
                {Array.isArray(resume.networking.communityContributions) && resume.networking.communityContributions.length > 0 ? (
                  <div className="space-y-2">
                    {resume.networking.communityContributions.map((c: any, idx: number) => (
                      <div key={`${c.title || 'contribution'}_${idx}`} className="type-body-primary text-gray-700">
                        <div className="type-ui-label">{c.title}</div>
                        {c.impact ? <div className="type-ui-meta text-gray-600">{c.impact}</div> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No contributions shared</div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {showNotes ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-gray-700" />
              <h2 className="type-h3 text-gray-900">Notes</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(notes).map(([key, value]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="type-ui-meta text-gray-600">{key}</div>
                  <div className="type-body-primary text-gray-800 mt-1 whitespace-pre-wrap">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="text-center text-xs text-gray-500 pb-10">
          Public profiles are device/browser-scoped for now (stored in localStorage).
        </div>
      </div>
    </div>
  );
}
