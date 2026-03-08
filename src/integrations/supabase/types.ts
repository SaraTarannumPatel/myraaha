export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          description: string | null
          earned_at: string
          id: string
          points: number | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          earned_at?: string
          id?: string
          points?: number | null
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          points?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          connection_type: string
          created_at: string
          id: string
          message: string | null
          receiver_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string
        }
        Insert: {
          connection_type?: string
          created_at?: string
          id?: string
          message?: string | null
          receiver_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string
        }
        Update: {
          connection_type?: string
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          experience_type: string
          id: string
          is_current: boolean | null
          organization: string | null
          skills_used: string[] | null
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          experience_type?: string
          id?: string
          is_current?: boolean | null
          organization?: string | null
          skills_used?: string[] | null
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          experience_type?: string
          id?: string
          is_current?: boolean | null
          organization?: string | null
          skills_used?: string[] | null
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exploration_quests: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          points: number | null
          quest_type: string
          sector: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          points?: number | null
          quest_type?: string
          sector?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          points?: number | null
          quest_type?: string
          sector?: string | null
          title?: string
        }
        Relationships: []
      }
      founder_profiles: {
        Row: {
          created_at: string
          experience_level: string | null
          founder_type: string | null
          id: string
          industries: string[] | null
          looking_for: string[] | null
          pitch: string | null
          strengths: string[] | null
          updated_at: string
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          founder_type?: string | null
          id?: string
          industries?: string[] | null
          looking_for?: string[] | null
          pitch?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          founder_type?: string | null
          id?: string
          industries?: string[] | null
          looking_for?: string[] | null
          pitch?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "mindset_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_card_interactions: {
        Row: {
          created_at: string
          id: string
          idea_card_id: string | null
          interaction_type: string
          notes: string | null
          startup_idea_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_card_id?: string | null
          interaction_type?: string
          notes?: string | null
          startup_idea_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_card_id?: string | null
          interaction_type?: string
          notes?: string | null
          startup_idea_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_card_interactions_idea_card_id_fkey"
            columns: ["idea_card_id"]
            isOneToOne: false
            referencedRelation: "idea_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_card_interactions_startup_idea_id_fkey"
            columns: ["startup_idea_id"]
            isOneToOne: false
            referencedRelation: "startup_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_cards: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          sector: string
          source: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          sector?: string
          source?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          sector?: string
          source?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          source: string | null
          strength: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          source?: string | null
          strength?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          source?: string | null
          strength?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          intent: Database["public"]["Enums"]["user_intent"] | null
          mood: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"] | null
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"] | null
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_track_progress: {
        Row: {
          completed_at: string | null
          current_module: number | null
          id: string
          notes: string | null
          started_at: string | null
          status: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_module?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_module?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_progress_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mindset_learning_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mindset_challenges: {
        Row: {
          challenge_type: string
          completed_at: string | null
          description: string | null
          id: string
          reflection: string | null
          started_at: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          challenge_type: string
          completed_at?: string | null
          description?: string | null
          id?: string
          reflection?: string | null
          started_at?: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          challenge_type?: string
          completed_at?: string | null
          description?: string | null
          id?: string
          reflection?: string | null
          started_at?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      mindset_habits: {
        Row: {
          best_streak: number | null
          category: string
          created_at: string
          description: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_completed_at: string | null
          streak: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          category?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          streak?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number | null
          category?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          streak?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mindset_learning_tracks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          modules: Json | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          modules?: Json | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          modules?: Json | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          notification_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      problem_observations: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          created_at: string
          feasibility: string | null
          id: string
          observation: string
          relevance_score: number | null
          scale: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string
          feasibility?: string | null
          id?: string
          observation: string
          relevance_score?: number | null
          scale?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string
          feasibility?: string | null
          id?: string
          observation?: string
          relevance_score?: number | null
          scale?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_intent: Database["public"]["Enums"]["user_intent"] | null
          age: number | null
          areas_of_focus: string[] | null
          avatar_url: string | null
          bio: string | null
          career_stage: string | null
          completion_percentage: number | null
          consent_data_usage: boolean | null
          consent_mentor_sharing: boolean | null
          created_at: string
          education_level: string | null
          full_name: string | null
          id: string
          industry: string | null
          location: string | null
          long_term_goals: string | null
          onboarding_status:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          short_term_goals: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          active_intent?: Database["public"]["Enums"]["user_intent"] | null
          age?: number | null
          areas_of_focus?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          career_stage?: string | null
          completion_percentage?: number | null
          consent_data_usage?: boolean | null
          consent_mentor_sharing?: boolean | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          long_term_goals?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          short_term_goals?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          active_intent?: Database["public"]["Enums"]["user_intent"] | null
          age?: number | null
          areas_of_focus?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          career_stage?: string | null
          completion_percentage?: number | null
          consent_data_usage?: boolean | null
          consent_mentor_sharing?: boolean | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          long_term_goals?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          short_term_goals?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          intent: Database["public"]["Enums"]["user_intent"]
          media_urls: string[] | null
          metadata: Json | null
          project_type: string
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"]
          media_urls?: string[] | null
          metadata?: Json | null
          project_type?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"]
          media_urls?: string[] | null
          metadata?: Json | null
          project_type?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quest_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          points_earned: number | null
          quest_id: string
          response: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          points_earned?: number | null
          quest_id: string
          response?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          points_earned?: number | null
          quest_id?: string
          response?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "exploration_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          id: string
          intent: Database["public"]["Enums"]["user_intent"] | null
          resource_type: string
          tags: string[] | null
          title: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"] | null
          resource_type?: string
          tags?: string[] | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"] | null
          resource_type?: string
          tags?: string[] | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      roadmap_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          order_index: number
          roadmap_id: string
          status: Database["public"]["Enums"]["roadmap_step_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number
          roadmap_id: string
          status?: Database["public"]["Enums"]["roadmap_step_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number
          roadmap_id?: string
          status?: Database["public"]["Enums"]["roadmap_step_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          intent: Database["public"]["Enums"]["user_intent"]
          is_active: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"]
          is_active?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"]
          is_active?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      selfgraph_data: {
        Row: {
          context: Json | null
          dimension: string
          id: string
          recorded_at: string
          user_id: string
          value: number
        }
        Insert: {
          context?: Json | null
          dimension: string
          id?: string
          recorded_at?: string
          user_id: string
          value?: number
        }
        Update: {
          context?: Json | null
          dimension?: string
          id?: string
          recorded_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          proficiency: number | null
          source: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          proficiency?: number | null
          source?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          proficiency?: number | null
          source?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      startup_ideas: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          notes: string | null
          problem_statement: string | null
          solution: string | null
          target_audience: string | null
          title: string
          updated_at: string
          user_id: string
          validation_score: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          problem_statement?: string | null
          solution?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
          user_id: string
          validation_score?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          problem_statement?: string | null
          solution?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validation_score?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      connection_status: "pending" | "accepted" | "declined"
      onboarding_status:
        | "welcome"
        | "user_type"
        | "intent"
        | "complete"
        | "personal_info"
        | "consent"
      project_status: "idea" | "planning" | "building" | "launched" | "archived"
      roadmap_step_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "skipped"
      user_intent: "career" | "entrepreneurship" | "both"
      user_type:
        | "school"
        | "college"
        | "transitioner"
        | "working_professional"
        | "aspiring_entrepreneur"
        | "freelancer"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      connection_status: ["pending", "accepted", "declined"],
      onboarding_status: [
        "welcome",
        "user_type",
        "intent",
        "complete",
        "personal_info",
        "consent",
      ],
      project_status: ["idea", "planning", "building", "launched", "archived"],
      roadmap_step_status: [
        "not_started",
        "in_progress",
        "completed",
        "skipped",
      ],
      user_intent: ["career", "entrepreneurship", "both"],
      user_type: [
        "school",
        "college",
        "transitioner",
        "working_professional",
        "aspiring_entrepreneur",
        "freelancer",
        "other",
      ],
    },
  },
} as const
