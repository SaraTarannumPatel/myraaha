import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Zap, 
  Lightbulb, 
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Heart,
  Award,
  BookOpen,
  Code,
  Briefcase,
  MessageCircle,
  Eye,
  Activity
} from 'lucide-react';

const CrossFeatureIntegration = () => {
  const { 
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
    trackEngagement
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Auto-optimize data flow on component mount
    optimizeDataFlow();
  }, [optimizeDataFlow]);

  const handleOptimizeDataFlow = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate optimization
    optimizeDataFlow();
    setIsOptimizing(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'ai-insights', name: 'AI Insights', icon: Brain },
    { id: 'cross-features', name: 'Cross-Features', icon: ArrowRight },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'optimization', name: 'Optimization', icon: Zap }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Profile</h3>
              <p className="text-sm text-gray-600">
                {userData.aiProfile.careerStage} • {userData.aiProfile.learningStyle}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Progress</h3>
              <p className="text-sm text-gray-600">
                {userData.progressMetrics.overallProgress}% Complete
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Engagement</h3>
              <p className="text-sm text-gray-600">
                {userData.crossFeatureData.progressAnalytics.engagementMetrics.sessionsCompleted} Sessions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Success Rate</h3>
              <p className="text-sm text-gray-600">
                {Math.round(predictCareerSuccess() * 100)}% Predicted
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Emotional State</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mood</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userData.aiProfile.emotionalState.currentMood === 'motivated' ? 'bg-green-100 text-green-800' :
                userData.aiProfile.emotionalState.currentMood === 'stressed' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {userData.aiProfile.emotionalState.currentMood}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Energy Level</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userData.aiProfile.emotionalState.energyLevel === 'high' ? 'bg-green-100 text-green-800' :
                userData.aiProfile.emotionalState.energyLevel === 'low' ? 'bg-red-100 text-red-800' :
                'bg-lightestPurple text-primary'
              }`}>
                {userData.aiProfile.emotionalState.energyLevel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Motivation</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userData.aiProfile.emotionalState.motivationLevel === 'high' ? 'bg-green-100 text-green-800' :
                userData.aiProfile.emotionalState.motivationLevel === 'low' ? 'bg-red-100 text-red-800' :
                'bg-lightestPurple text-primary'
              }`}>
                {userData.aiProfile.emotionalState.motivationLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Style</span>
              <span className="text-sm font-medium text-gray-900">{userData.aiProfile.learningStyle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pace</span>
              <span className="text-sm font-medium text-gray-900">{userData.aiProfile.learningPreferences.pace}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Structure</span>
              <span className="text-sm font-medium text-gray-900">{userData.aiProfile.learningPreferences.structure}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIInsights = () => {
    const insights = generateMotivationalInsights();
    const behavioralPatterns = analyzeBehavioralPatterns();
    const contextualRecommendations = generateContextualRecommendations('mood');

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            AI-Generated Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Behavioral Patterns
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peak Hours</span>
                <span className="text-sm font-medium text-gray-900">{behavioralPatterns.mostProductiveTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="text-sm font-medium text-gray-900">{behavioralPatterns.engagementRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Goal Completion</span>
                <span className="text-sm font-medium text-gray-900">{behavioralPatterns.goalCompletion}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" />
              Contextual Recommendations
            </h3>
            <div className="space-y-3">
              {contextualRecommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-lightestPurple rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-lightestPurple0' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                      <p className="text-xs text-gray-600">{rec.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCrossFeatures = () => {
    const dataFlow = userData.crossFeatureData.dataFlow;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowRight className="h-5 w-5 mr-2 text-purple-600" />
            Cross-Feature Data Flow
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Curiosity → Roadmaps</h4>
              <p className="text-sm text-purple-700">
                {dataFlow.curiosityToRoadmaps.length} connections
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Mood → Recommendations</h4>
              <p className="text-sm text-blue-700">
                {dataFlow.moodToRecommendations.length} recommendations
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Skills → Projects</h4>
              <p className="text-sm text-green-700">
                {dataFlow.skillsToProjects.length} project suggestions
              </p>
            </div>
            <div className="p-4 bg-lightestPurple rounded-lg">
              <h4 className="font-medium text-primary mb-2">Achievements → Motivation</h4>
              <p className="text-sm text-primary">
                {dataFlow.achievementsToMotivation.length} motivational items
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Reflections → Insights</h4>
              <p className="text-sm text-orange-700">
                {dataFlow.reflectionsToInsights.length} insights generated
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Impact Analysis</h3>
            <div className="space-y-4">
              {['mood', 'social', 'projects', 'mentors'].map(feature => {
                const impact = getFeatureImpactAnalysis(feature);
                return (
                  <div key={feature} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">{feature}</span>
                      <span className="text-sm text-gray-600">{Math.round(impact.impact * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${impact.impact * 100}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{impact.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm text-gray-900">
                  {new Date(userData.crossFeatureData.featureSync.lastSync).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userData.crossFeatureData.featureSync.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                  userData.crossFeatureData.featureSync.syncStatus === 'pending' ? 'bg-lightestPurple text-primary' :
                  'bg-red-100 text-red-800'
                }`}>
                  {userData.crossFeatureData.featureSync.syncStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Sync</span>
                <span className="text-sm text-gray-900">
                  {userData.crossFeatureData.featureSync.autoSync ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const analytics = userData.crossFeatureData.progressAnalytics;
    const engagement = analytics.engagementMetrics;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{engagement.timeSpent}h</div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{engagement.sessionsCompleted}</div>
            <div className="text-sm text-gray-600">Sessions</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{engagement.contentConsumed}</div>
            <div className="text-sm text-gray-600">Content Items</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{engagement.interactions}</div>
            <div className="text-sm text-gray-600">Interactions</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Patterns</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peak Hours</span>
                <span className="text-sm text-gray-900">
                  {analytics.behavioralPatterns.peakProductivityHours.join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preferred Days</span>
                <span className="text-sm text-gray-900">
                  {analytics.behavioralPatterns.preferredLearningDays.join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="text-sm text-gray-900">{analytics.behavioralPatterns.contentEngagementRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Burnout Risk</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  analytics.predictiveAnalytics.burnoutRisk === 'low' ? 'bg-green-100 text-green-800' :
                  analytics.predictiveAnalytics.burnoutRisk === 'medium' ? 'bg-lightestPurple text-primary' :
                  'bg-red-100 text-red-800'
                }`}>
                  {analytics.predictiveAnalytics.burnoutRisk}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Probability</span>
                <span className="text-sm text-gray-900">
                  {Math.round(analytics.predictiveAnalytics.successProbability * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Interventions</span>
                <span className="text-sm text-gray-900">
                  {analytics.predictiveAnalytics.recommendedInterventions.length} suggested
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptimization = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-primary" />
          Data Flow Optimization
        </h3>
        <p className="text-gray-600 mb-6">
          Optimize cross-feature data synchronization and AI personalization for better user experience.
        </p>
        <button
          onClick={handleOptimizeDataFlow}
          disabled={isOptimizing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isOptimizing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          <span>{isOptimizing ? 'Optimizing...' : 'Optimize Data Flow'}</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={syncCuriosityToRoadmaps}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Sync Curiosity to Roadmaps</span>
            </button>
            <button
              onClick={syncMoodToRecommendations}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              <Heart className="h-4 w-4" />
              <span>Sync Mood to Recommendations</span>
            </button>
            <button
              onClick={syncSkillsToProjects}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              <Code className="h-4 w-4" />
              <span>Sync Skills to Projects</span>
            </button>
            <button
              onClick={syncAchievementsToMotivation}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              <Award className="h-4 w-4" />
              <span>Sync Achievements to Motivation</span>
            </button>
            <button
              onClick={syncReflectionsToInsights}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Sync Reflections to Insights</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Indicators</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">AI Profile Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Cross-Feature Sync Enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Behavioral Tracking Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Predictive Analytics Running</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700">Last Optimization: 2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'ai-insights':
        return renderAIInsights();
      case 'cross-features':
        return renderCrossFeatures();
      case 'analytics':
        return renderAnalytics();
      case 'optimization':
        return renderOptimization();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cross-Feature Integration</h1>
              <p className="text-gray-600 mt-2">
                AI-powered personalization and seamless data flow across all features
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">All Systems Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CrossFeatureIntegration;
