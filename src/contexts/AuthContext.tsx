import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { purgeOnLogout } from "@/lib/security/safeStorage";
import { startSessionTimers, recordLoginSuccess } from "@/lib/security/authGuard";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  age: number | null;
  user_type: string | null;
  active_intent: string;
  onboarding_status: string;
  completion_percentage: number;
  location: string | null;
  education_level: string | null;
  industry: string | null;
  career_stage: string | null;
  short_term_goals: string | null;
  long_term_goals: string | null;
  consent_data_usage: boolean;
  consent_mentor_sharing: boolean;
  areas_of_focus: string[];
  journey_variant: string | null;
  journey_responses: any;
  mobile_number: string | null;
  gender_identity: string | null;
  age_group: string | null;
  life_stage: string | null;
  academic_stream: string | null;
  highest_education: string | null;
  primary_device: string | null;
  digital_comfort: string | null;
  ai_comfort: string | null;
  time_commitment: string | null;
  weekly_hours: string | null;
  location_type: string | null;
  preferred_language: string | null;
  public_uid: string | null;
  date_of_birth: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isReady: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data as unknown as Profile);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let stopTimers: (() => void) | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
          if (event === "SIGNED_IN") recordLoginSuccess();
          // Idle (30m) + absolute (12h) timers; cleanup on next state change.
          if (stopTimers) stopTimers();
          stopTimers = startSessionTimers(async () => {
            try { await supabase.auth.signOut({ scope: "local" } as any); } catch {}
            purgeOnLogout();
            window.location.replace("/auth?mode=signin");
          });
        } else {
          setProfile(null);
          if (stopTimers) { stopTimers(); stopTimers = null; }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setLoading(false);
          setIsReady(true);
        });
      } else {
        setLoading(false);
        setIsReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (stopTimers) stopTimers();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    // Clear React state immediately so UI doesn't wait on network
    setUser(null);
    setSession(null);
    setProfile(null);
    // SECURITY: full storage purge + tell the service worker to wipe its caches
    // so no private API response can be re-served to the next user on the same
    // device. Additive — preserves the original explicit-key drop list below.
    try {
      const drop = [
        "myraaha_is_guest",
        "myraaha_uid_reveal_pending",
        "myraaha_shown_reward_celebrations",
        "myraaha_compass_intro_seen",
        "myraaha_initial_path",
      ];
      drop.forEach((k) => localStorage.removeItem(k));
    } catch {}
    purgeOnLogout();
    // Local-scope signOut is instant; race against a short timeout so the
    // button never hangs if the network is slow.
    const localSignOut = supabase.auth.signOut({ scope: "local" } as any).catch(() => {});
    await Promise.race([localSignOut, new Promise((r) => setTimeout(r, 1200))]);
    // Hard reload to a clean state
    window.location.replace("/auth?mode=signin");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates as any)
      .eq("user_id", user.id);
    if (!error) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isReady, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
