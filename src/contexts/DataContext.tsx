import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface UserData {
  aiProfile: {
    careerStage: string;
    learningStyle: string;
    emotionalState: {
      currentMood: string;
      energyLevel: string;
      motivationLevel: string;
    };
    learningPreferences: {
      pace: string;
      structure: string;
    };
  };
  progressMetrics: {
    overallProgress: number;
  };
  crossFeatureData: {
    progressAnalytics: {
      engagementMetrics: {
        sessionsCompleted: number;
        timeSpent: number;
        contentConsumed: number;
        interactions: number;
      };
      behavioralPatterns: {
        peakProductivityHours: string[];
        preferredLearningDays: string[];
        contentEngagementRate: number;
      };
      predictiveAnalytics: {
        burnoutRisk: string;
        successProbability: number;
        recommendedInterventions: string[];
      };
    };
    dataFlow: {
      curiosityToRoadmaps: string[];
      moodToRecommendations: string[];
      skillsToProjects: string[];
      achievementsToMotivation: string[];
      reflectionsToInsights: string[];
    };
    featureSync: {
      lastSync: string;
      syncStatus: string;
      autoSync: boolean;
    };
  };
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
}

interface BehavioralPattern {
  mostProductiveTime: string;
  engagementRate: number;
  goalCompletion: number;
}

interface FeatureImpact {
  impact: number;
  description: string;
}

interface DataContextType {
  userData: UserData;
  generateContextualRecommendations: (type: string) => Recommendation[];
  analyzeBehavioralPatterns: () => BehavioralPattern;
  predictCareerSuccess: () => number;
  generateMotivationalInsights: () => string[];
  getFeatureImpactAnalysis: (feature: string) => FeatureImpact;
  optimizeDataFlow: () => void;
  syncCuriosityToRoadmaps: () => void;
  syncMoodToRecommendations: () => void;
  syncSkillsToProjects: () => void;
  syncAchievementsToMotivation: () => void;
  syncReflectionsToInsights: () => void;
  updateEmotionalState: (mood: string, energy: string, motivation: string) => void;
  updateLearningPreferences: (pace: string, structure: string) => void;
  trackEngagement: (session: any) => void;
}

const defaultUserData: UserData = {
  aiProfile: {
    careerStage: 'Early Career',
    learningStyle: 'Visual & Hands-on',
    emotionalState: {
      currentMood: 'motivated',
      energyLevel: 'high',
      motivationLevel: 'high',
    },
    learningPreferences: {
      pace: 'self-paced',
      structure: 'guided',
    },
  },
  progressMetrics: {
    overallProgress: 68,
  },
  crossFeatureData: {
    progressAnalytics: {
      engagementMetrics: {
        sessionsCompleted: 14,
        timeSpent: 28,
        contentConsumed: 48,
        interactions: 156,
      },
      behavioralPatterns: {
        peakProductivityHours: ['Morning (9 AM - 11 AM)', 'Evening (7 PM - 9 PM)'],
        preferredLearningDays: ['Monday', 'Wednesday', 'Friday'],
        contentEngagementRate: 85,
      },
      predictiveAnalytics: {
        burnoutRisk: 'low',
        successProbability: 0.88,
        recommendedInterventions: [
          'Schedule a reflection session',
          'Review skill map progress',
          'Take a short break before starting new project'
        ],
      },
    },
    dataFlow: {
      curiosityToRoadmaps: ['Artificial Intelligence', 'Full Stack Development'],
      moodToRecommendations: ['Focus exercise', 'Goal mapping session'],
      skillsToProjects: ['React Dashboard', 'Supabase Migration Script'],
      achievementsToMotivation: ['Database Migrator Badge', '7-Day Streak'],
      reflectionsToInsights: ['Identified gap in relational database knowledge', 'Improved UI/UX responsiveness'],
    },
    featureSync: {
      lastSync: new Date().toISOString(),
      syncStatus: 'synced',
      autoSync: true,
    },
  },
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  const generateContextualRecommendations = useCallback((type: string): Recommendation[] => {
    return [
      {
        priority: 'high',
        title: 'Review newly imported Career Paths',
        reason: 'We synchronized the public directory. Explore paths relevant to your target domain.',
      },
      {
        priority: 'medium',
        title: 'Map a new Curiosity Compass journey',
        reason: 'Aligning curiosity inputs with career pathways improves personalization accuracy.',
      },
      {
        priority: 'low',
        title: 'Log your current mood',
        reason: 'Mood patterns help schedule learning modules during peak productivity times.',
      },
    ];
  }, []);

  const analyzeBehavioralPatterns = useCallback((): BehavioralPattern => {
    return {
      mostProductiveTime: 'Morning (9 AM - 11 AM)',
      engagementRate: 92,
      goalCompletion: 85,
    };
  }, []);

  const predictCareerSuccess = useCallback((): number => {
    return userData.crossFeatureData.progressAnalytics.predictiveAnalytics.successProbability;
  }, [userData]);

  const generateMotivationalInsights = useCallback((): string[] => {
    return [
      "Consistent pace! You've logged active learning sessions over the past 3 consecutive days.",
      "Vibrant learning loop detected. Data is flowing smoothly between your Curiosity Compass and AI Roadmaps.",
      "Database schema synchronization completed successfully."
    ];
  }, []);

  const getFeatureImpactAnalysis = useCallback((feature: string): FeatureImpact => {
    const featureMap: Record<string, FeatureImpact> = {
      mood: { impact: 0.78, description: 'Mood logs significantly influence scheduling efficiency and burnout prevention.' },
      social: { impact: 0.65, description: 'Peer interactions boost learning consistency and milestone achievement.' },
      projects: { impact: 0.85, description: 'Project playground builds practical confidence, accelerating career outcomes.' },
      mentors: { impact: 0.72, description: 'Mentor matches provide qualitative course-correction on roadmaps.' },
    };
    return featureMap[feature] || { impact: 0.5, description: 'Aids overall learning consistency.' };
  }, []);

  const optimizeDataFlow = useCallback(() => {
    setUserData(prev => ({
      ...prev,
      crossFeatureData: {
        ...prev.crossFeatureData,
        featureSync: {
          lastSync: new Date().toISOString(),
          syncStatus: 'synced',
          autoSync: true,
        },
      },
    }));
  }, []);

  const syncCuriosityToRoadmaps = useCallback(() => {
    console.log('Synchronizing Curiosity to Roadmaps...');
  }, []);

  const syncMoodToRecommendations = useCallback(() => {
    console.log('Synchronizing Mood to Recommendations...');
  }, []);

  const syncSkillsToProjects = useCallback(() => {
    console.log('Synchronizing Skills to Projects...');
  }, []);

  const syncAchievementsToMotivation = useCallback(() => {
    console.log('Synchronizing Achievements to Motivation...');
  }, []);

  const syncReflectionsToInsights = useCallback(() => {
    console.log('Synchronizing Reflections to Insights...');
  }, []);

  const updateEmotionalState = useCallback((mood: string, energy: string, motivation: string) => {
    setUserData(prev => ({
      ...prev,
      aiProfile: {
        ...prev.aiProfile,
        emotionalState: {
          currentMood: mood,
          energyLevel: energy,
          motivationLevel: motivation,
        },
      },
    }));
  }, []);

  const updateLearningPreferences = useCallback((pace: string, structure: string) => {
    setUserData(prev => ({
      ...prev,
      aiProfile: {
        ...prev.aiProfile,
        learningPreferences: { pace, structure },
      },
    }));
  }, []);

  const trackEngagement = useCallback((session: any) => {
    console.log('Tracking session engagement:', session);
  }, []);

  return (
    <DataContext.Provider
      value={{
        userData,
        generateContextualRecommendations,
        analyzeBehavioralPatterns,
        predictCareerSuccess,
        generateMotivationalInsights,
        getFeatureImpactAnalysis,
        optimizeDataFlow,
        syncCuriosityToRoadmaps,
        syncMoodToRecommendations,
        syncSkillsToProjects,
        syncAchievementsToMotivation,
        syncReflectionsToInsights,
        updateEmotionalState,
        updateLearningPreferences,
        trackEngagement,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
