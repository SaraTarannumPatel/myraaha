import { useMemo, useState } from 'react';
import { useParams, Navigate, Link as RouterLink } from 'react-router-dom';
import { Eye, Lock, Shield, ArrowLeft } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import MobileSharedResume from './mobile/MobileSharedResume';

type SharedResumePayload = {
  resume: any;
  sharingSettings: any;
  privacySettings: any;
  contextualNotes?: Record<string, string>;
  metadata?: {
    createdAt?: string;
    expiresAt?: string;
    createdByUserId?: string;
  };
};

export default function SharedResume(): JSX.Element {
  const isMobile = useMobile();
  const params = useParams();
  const shareId = params.shareId;

  const payload = useMemo(() => {
    if (!shareId) return null;
    try {
      const raw = localStorage.getItem(`shuttlex_shared_resume_${shareId}`);
      if (!raw) return null;
      return JSON.parse(raw) as SharedResumePayload;
    } catch {
      return null;
    }
  }, [shareId]);

  const isExpired = useMemo(() => {
    const expiresAt = payload?.metadata?.expiresAt;
    if (!expiresAt) return false;
    const d = new Date(expiresAt);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() < Date.now();
  }, [payload]);

  const isLocked = useMemo(() => {
    return Boolean(payload?.sharingSettings?.passwordProtected);
  }, [payload]);

  const expectedPassword = useMemo(() => {
    const p = payload?.sharingSettings?.sharePassword;
    return typeof p === 'string' ? p : '';
  }, [payload]);

  const [enteredPassword, setEnteredPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  if (!shareId) return <Navigate to="/" replace />;

  if (!payload) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gray-700" />
            <h1 className="type-h4 text-gray-900">Shared Resume Not Found</h1>
          </div>
          <p className="type-ui-meta text-gray-600">This share link doesn’t exist on this device/browser (MVP local-only sharing), or it was revoked.</p>
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

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-red-600" />
            <h1 className="type-h4 text-gray-900">Link Expired</h1>
          </div>
          <p className="type-ui-meta text-gray-600">This shared resume link has expired.</p>
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

  if (isLocked && !unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-gray-700" />
            <h1 className="type-h4 text-gray-900">Password Required</h1>
          </div>
          <p className="type-ui-meta text-gray-600">This Living Resume share link is password protected.</p>

          <div className="mt-4">
            <label className="block type-ui-meta text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg type-ui-button"
              onClick={() => {
                if (enteredPassword === expectedPassword) {
                  setUnlocked(true);
                } else {
                  alert('Incorrect password');
                }
              }}
            >
              Unlock
            </button>
          </div>

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

  if (isMobile) {
    return (
      <MobileSharedResume 
        resume={resume} 
        payload={payload} 
        isLocked={isLocked}
        unlocked={unlocked}
        enteredPassword={enteredPassword}
        setEnteredPassword={setEnteredPassword}
        onUnlock={() => {
          if (enteredPassword === expectedPassword) {
            setUnlocked(true);
          } else {
            alert('Incorrect password');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Eye className="h-4 w-4" />
                <span>Shared Living Resume</span>
              </div>
              <h1 className="type-h2 text-gray-900">{resume.name || 'Living Resume'}</h1>
              {resume.headline ? <div className="type-body-primary text-gray-700 mt-1">{resume.headline}</div> : null}
              {resume.summary ? <p className="type-ui-meta text-gray-600 mt-3">{resume.summary}</p> : null}
            </div>
            <RouterLink
              to="/jobs/living-resume"
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
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

        {Object.keys(notes).length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="type-h3 text-gray-900 mb-4">Notes</h2>
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
          MVP local-only sharing: share links work only on the same browser/device.
        </div>
      </div>
    </div>
  );
}
