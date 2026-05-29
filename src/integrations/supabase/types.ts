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
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string
          id: string
          inputs_hash: string | null
          module: string
          payload: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          id?: string
          inputs_hash?: string | null
          module: string
          payload?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          id?: string
          inputs_hash?: string | null
          module?: string
          payload?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_conclusions: {
        Row: {
          archetype: string | null
          archetype_description: string | null
          cognitive_style: string | null
          confidence_score: number | null
          generated_at: string
          growth_areas: string[] | null
          id: string
          ideal_environment: string | null
          motivation_type: string | null
          raw_signals: Json | null
          recommended_career_paths: string[] | null
          recommended_modules: Json | null
          strengths: string[] | null
          test_type: string
          top_domains: string[] | null
          top_skills: string[] | null
          updated_at: string
          user_id: string
          work_style: string | null
        }
        Insert: {
          archetype?: string | null
          archetype_description?: string | null
          cognitive_style?: string | null
          confidence_score?: number | null
          generated_at?: string
          growth_areas?: string[] | null
          id?: string
          ideal_environment?: string | null
          motivation_type?: string | null
          raw_signals?: Json | null
          recommended_career_paths?: string[] | null
          recommended_modules?: Json | null
          strengths?: string[] | null
          test_type: string
          top_domains?: string[] | null
          top_skills?: string[] | null
          updated_at?: string
          user_id: string
          work_style?: string | null
        }
        Update: {
          archetype?: string | null
          archetype_description?: string | null
          cognitive_style?: string | null
          confidence_score?: number | null
          generated_at?: string
          growth_areas?: string[] | null
          id?: string
          ideal_environment?: string | null
          motivation_type?: string | null
          raw_signals?: Json | null
          recommended_career_paths?: string[] | null
          recommended_modules?: Json | null
          strengths?: string[] | null
          test_type?: string
          top_domains?: string[] | null
          top_skills?: string[] | null
          updated_at?: string
          user_id?: string
          work_style?: string | null
        }
        Relationships: []
      }
      assessment_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          highest_milestone_reached: number
          id: string
          last_question_at: string | null
          progress_percentage: number
          questions_completed: number
          questions_total: number
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          highest_milestone_reached?: number
          id?: string
          last_question_at?: string | null
          progress_percentage?: number
          questions_completed?: number
          questions_total?: number
          test_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          highest_milestone_reached?: number
          id?: string
          last_question_at?: string | null
          progress_percentage?: number
          questions_completed?: number
          questions_total?: number
          test_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_question_signals: {
        Row: {
          answer_label: string | null
          answer_value: string | null
          created_at: string
          id: string
          question_id: string
          question_text: string | null
          signal_tags: string[] | null
          target_modules: string[] | null
          test_type: string
          user_id: string
          weight: number | null
        }
        Insert: {
          answer_label?: string | null
          answer_value?: string | null
          created_at?: string
          id?: string
          question_id: string
          question_text?: string | null
          signal_tags?: string[] | null
          target_modules?: string[] | null
          test_type: string
          user_id: string
          weight?: number | null
        }
        Update: {
          answer_label?: string | null
          answer_value?: string | null
          created_at?: string
          id?: string
          question_id?: string
          question_text?: string | null
          signal_tags?: string[] | null
          target_modules?: string[] | null
          test_type?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      badge_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
          type: string
          unlock_criteria: Json | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
          type: string
          unlock_criteria?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
          type?: string
          unlock_criteria?: Json | null
        }
        Relationships: []
      }
      behavior_patterns: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          domains_affected: string[] | null
          first_observed: string
          frequency: string | null
          id: string
          is_positive: boolean | null
          last_observed: string
          occurrences: number | null
          pattern_description: string
          pattern_type: string
          strength: number | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          domains_affected?: string[] | null
          first_observed?: string
          frequency?: string | null
          id?: string
          is_positive?: boolean | null
          last_observed?: string
          occurrences?: number | null
          pattern_description: string
          pattern_type: string
          strength?: number | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          domains_affected?: string[] | null
          first_observed?: string
          frequency?: string | null
          id?: string
          is_positive?: boolean | null
          last_observed?: string
          occurrences?: number | null
          pattern_description?: string
          pattern_type?: string
          strength?: number | null
          user_id?: string
        }
        Relationships: []
      }
      career_applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          resume_url: string
          role_id: string
          role_title: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          resume_url: string
          role_id: string
          role_title: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          resume_url?: string
          role_id?: string
          role_title?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      career_card_interactions: {
        Row: {
          card_id: string
          created_at: string
          id: string
          interaction_type: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          interaction_type?: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_card_interactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "career_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      career_cards: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          icon_emoji: string | null
          id: string
          skills_related: string[] | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          icon_emoji?: string | null
          id?: string
          skills_related?: string[] | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          icon_emoji?: string | null
          id?: string
          skills_related?: string[] | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      career_path_interactions: {
        Row: {
          career_path_id: string
          created_at: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          career_path_id: string
          created_at?: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          career_path_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_path_interactions_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      career_paths: {
        Row: {
          avg_salary_usd: string | null
          countries_in_demand: string[] | null
          created_at: string | null
          day_to_day: string | null
          demand_level: string | null
          description: string | null
          difficulty: string | null
          domain: string
          growth_trajectory: string | null
          growth_trajectory_detail: string | null
          icon_emoji: string | null
          id: string
          industry: string | null
          industry_trends: string | null
          interests: string[] | null
          job_role_keywords: string[] | null
          keywords: string[] | null
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          salary_range: string | null
          sector: string | null
          soft_skills: string[] | null
          title: string
          tools_certifications: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          day_to_day?: string | null
          demand_level?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string
          growth_trajectory?: string | null
          growth_trajectory_detail?: string | null
          icon_emoji?: string | null
          id?: string
          industry?: string | null
          industry_trends?: string | null
          interests?: string[] | null
          job_role_keywords?: string[] | null
          keywords?: string[] | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          salary_range?: string | null
          sector?: string | null
          soft_skills?: string[] | null
          title: string
          tools_certifications?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          day_to_day?: string | null
          demand_level?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string
          growth_trajectory?: string | null
          growth_trajectory_detail?: string | null
          icon_emoji?: string | null
          id?: string
          industry?: string | null
          industry_trends?: string | null
          interests?: string[] | null
          job_role_keywords?: string[] | null
          keywords?: string[] | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          salary_range?: string | null
          sector?: string | null
          soft_skills?: string[] | null
          title?: string
          tools_certifications?: string[] | null
        }
        Relationships: []
      }
      career_stories: {
        Row: {
          advice: string | null
          career_path_id: string | null
          cons: string[] | null
          created_at: string
          day_in_life: string | null
          difficulty_level: string | null
          domain: string
          id: string
          is_active: boolean | null
          is_ai_generated: boolean | null
          narrator_experience_years: number | null
          narrator_name: string
          narrator_role: string
          pros: string[] | null
          skills_highlighted: string[] | null
          story_content: string
          tags: string[] | null
          title: string
        }
        Insert: {
          advice?: string | null
          career_path_id?: string | null
          cons?: string[] | null
          created_at?: string
          day_in_life?: string | null
          difficulty_level?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          is_ai_generated?: boolean | null
          narrator_experience_years?: number | null
          narrator_name: string
          narrator_role: string
          pros?: string[] | null
          skills_highlighted?: string[] | null
          story_content: string
          tags?: string[] | null
          title: string
        }
        Update: {
          advice?: string | null
          career_path_id?: string | null
          cons?: string[] | null
          created_at?: string
          day_in_life?: string | null
          difficulty_level?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          is_ai_generated?: boolean | null
          narrator_experience_years?: number | null
          narrator_name?: string
          narrator_role?: string
          pros?: string[] | null
          skills_highlighted?: string[] | null
          story_content?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_stories_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      career_story_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          story_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          story_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          story_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_story_interactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "career_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_card_interactions: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          interaction_type: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          interaction_type: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_card_interactions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "domain_challenge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_enrollments: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          points_earned: number | null
          reflection: string | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          reflection?: string | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          reflection?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_enrollments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "project_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      clarity_scores: {
        Row: {
          activity_alignment: number | null
          direction_confidence: number | null
          factors: Json | null
          goal_alignment: number | null
          id: string
          interest_alignment: number | null
          overall_clarity: number
          recorded_at: string
          reflection_prompt: string | null
          user_id: string
          user_reflection: string | null
        }
        Insert: {
          activity_alignment?: number | null
          direction_confidence?: number | null
          factors?: Json | null
          goal_alignment?: number | null
          id?: string
          interest_alignment?: number | null
          overall_clarity?: number
          recorded_at?: string
          reflection_prompt?: string | null
          user_id: string
          user_reflection?: string | null
        }
        Update: {
          activity_alignment?: number | null
          direction_confidence?: number | null
          factors?: Json | null
          goal_alignment?: number | null
          id?: string
          interest_alignment?: number | null
          overall_clarity?: number
          recorded_at?: string
          reflection_prompt?: string | null
          user_id?: string
          user_reflection?: string | null
        }
        Relationships: []
      }
      coaching_checkins: {
        Row: {
          ai_response: Json | null
          confidence: number | null
          created_at: string
          energy: number | null
          id: string
          mood: string
          reflection: string | null
          user_id: string
        }
        Insert: {
          ai_response?: Json | null
          confidence?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          mood: string
          reflection?: string | null
          user_id: string
        }
        Update: {
          ai_response?: Json | null
          confidence?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          mood?: string
          reflection?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          mood: string | null
          title: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          mood?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          mood?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          community_type: string
          created_at: string
          created_by: string | null
          description: string | null
          icon_emoji: string | null
          id: string
          is_featured: boolean | null
          member_count: number | null
          name: string
          tags: string[] | null
          topic: string
          updated_at: string
        }
        Insert: {
          community_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_featured?: boolean | null
          member_count?: number | null
          name: string
          tags?: string[] | null
          topic?: string
          updated_at?: string
        }
        Update: {
          community_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_featured?: boolean | null
          member_count?: number | null
          name?: string
          tags?: string[] | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          community_id: string
          content: string
          created_at: string
          id: string
          likes_count: number | null
          post_type: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          community_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_type?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_type?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      company_challenges: {
        Row: {
          company_name: string
          compensation: string | null
          created_at: string | null
          current_applicants: number | null
          deadline: string | null
          deliverables: string[] | null
          description: string | null
          domain: string | null
          duration: string | null
          id: string
          max_applicants: number | null
          problem_statement: string | null
          required_skills: string[] | null
          status: string | null
          title: string
        }
        Insert: {
          company_name: string
          compensation?: string | null
          created_at?: string | null
          current_applicants?: number | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          domain?: string | null
          duration?: string | null
          id?: string
          max_applicants?: number | null
          problem_statement?: string | null
          required_skills?: string[] | null
          status?: string | null
          title: string
        }
        Update: {
          company_name?: string
          compensation?: string | null
          created_at?: string | null
          current_applicants?: number | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          domain?: string | null
          duration?: string | null
          id?: string
          max_applicants?: number | null
          problem_statement?: string | null
          required_skills?: string[] | null
          status?: string | null
          title?: string
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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_bookmarks: {
        Row: {
          collection: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          collection?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          collection?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_library_ingest_runs: {
        Row: {
          created_at: string
          id: string
          items_inserted: number
          notes: string | null
          run_type: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          items_inserted?: number
          notes?: string | null
          run_type?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          items_inserted?: number
          notes?: string | null
          run_type?: string
          status?: string
        }
        Relationships: []
      }
      content_library_items: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean
          language: string | null
          metadata: Json | null
          rating: number | null
          source_name: string | null
          source_url: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          topics: string[] | null
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          language?: string | null
          metadata?: Json | null
          rating?: number | null
          source_name?: string | null
          source_url: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          topics?: string[] | null
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          language?: string | null
          metadata?: Json | null
          rating?: number | null
          source_name?: string | null
          source_url?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          topics?: string[] | null
        }
        Relationships: []
      }
      countries_directory: {
        Row: {
          avg_salary_usd: string | null
          continent: string | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          gdp_rank: string | null
          growth_trajectory: string | null
          icon_emoji: string | null
          id: string
          interests: string[] | null
          keywords: string[] | null
          name: string
          official_languages: string[] | null
          population: string | null
          soft_skills_in_demand: string[] | null
          top_careers: string[] | null
          top_courses: string[] | null
          top_domains: string[] | null
          top_industries: string[] | null
          top_job_roles: string[] | null
          top_sectors: string[] | null
          top_skills: string[] | null
          top_subjects: string[] | null
          top_universities: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          continent?: string | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          gdp_rank?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          official_languages?: string[] | null
          population?: string | null
          soft_skills_in_demand?: string[] | null
          top_careers?: string[] | null
          top_courses?: string[] | null
          top_domains?: string[] | null
          top_industries?: string[] | null
          top_job_roles?: string[] | null
          top_sectors?: string[] | null
          top_skills?: string[] | null
          top_subjects?: string[] | null
          top_universities?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          continent?: string | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          gdp_rank?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          official_languages?: string[] | null
          population?: string | null
          soft_skills_in_demand?: string[] | null
          top_careers?: string[] | null
          top_courses?: string[] | null
          top_domains?: string[] | null
          top_industries?: string[] | null
          top_job_roles?: string[] | null
          top_sectors?: string[] | null
          top_skills?: string[] | null
          top_subjects?: string[] | null
          top_universities?: string[] | null
        }
        Relationships: []
      }
      curiosity_quest_progress: {
        Row: {
          analysis_results: Json | null
          completed_at: string | null
          id: string
          mood_checkpoint: string | null
          points_earned: number | null
          quest_id: string
          responses: Json | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          completed_at?: string | null
          id?: string
          mood_checkpoint?: string | null
          points_earned?: number | null
          quest_id: string
          responses?: Json | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          completed_at?: string | null
          id?: string
          mood_checkpoint?: string | null
          points_earned?: number | null
          quest_id?: string
          responses?: Json | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curiosity_quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "curiosity_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      curiosity_quests: {
        Row: {
          badge_reward: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          points: number | null
          prompts: Json | null
          quest_type: string
          title: string
        }
        Insert: {
          badge_reward?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number | null
          prompts?: Json | null
          quest_type?: string
          title: string
        }
        Update: {
          badge_reward?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number | null
          prompts?: Json | null
          quest_type?: string
          title?: string
        }
        Relationships: []
      }
      decision_actions: {
        Row: {
          action_description: string | null
          action_title: string
          action_type: string
          created_at: string
          domains_explored: string[] | null
          id: string
          impact_score: number | null
          mood_at_action: string | null
          reflection: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          skills_gained: string[] | null
          user_id: string
        }
        Insert: {
          action_description?: string | null
          action_title: string
          action_type: string
          created_at?: string
          domains_explored?: string[] | null
          id?: string
          impact_score?: number | null
          mood_at_action?: string | null
          reflection?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          skills_gained?: string[] | null
          user_id: string
        }
        Update: {
          action_description?: string | null
          action_title?: string
          action_type?: string
          created_at?: string
          domains_explored?: string[] | null
          id?: string
          impact_score?: number | null
          mood_at_action?: string | null
          reflection?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          skills_gained?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      domain_affinity: {
        Row: {
          affinity_score: number
          content_consumed: number | null
          created_at: string
          domain_name: string
          id: string
          last_interaction: string | null
          tasks_completed: number | null
          time_invested_minutes: number | null
          trend: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affinity_score?: number
          content_consumed?: number | null
          created_at?: string
          domain_name: string
          id?: string
          last_interaction?: string | null
          tasks_completed?: number | null
          time_invested_minutes?: number | null
          trend?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affinity_score?: number
          content_consumed?: number | null
          created_at?: string
          domain_name?: string
          id?: string
          last_interaction?: string | null
          tasks_completed?: number | null
          time_invested_minutes?: number | null
          trend?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      domain_challenge_cards: {
        Row: {
          career_path_id: string | null
          challenge_name: string
          compensation: string | null
          created_at: string
          difficulty_level: string
          domain: string
          estimated_time: string
          id: string
          is_active: boolean | null
          is_ai_generated: boolean | null
          skills_needed: string[] | null
          tags: string[] | null
          task_description: string
          tools_used: string[] | null
        }
        Insert: {
          career_path_id?: string | null
          challenge_name: string
          compensation?: string | null
          created_at?: string
          difficulty_level?: string
          domain?: string
          estimated_time?: string
          id?: string
          is_active?: boolean | null
          is_ai_generated?: boolean | null
          skills_needed?: string[] | null
          tags?: string[] | null
          task_description: string
          tools_used?: string[] | null
        }
        Update: {
          career_path_id?: string | null
          challenge_name?: string
          compensation?: string | null
          created_at?: string
          difficulty_level?: string
          domain?: string
          estimated_time?: string
          id?: string
          is_active?: boolean | null
          is_ai_generated?: boolean | null
          skills_needed?: string[] | null
          tags?: string[] | null
          task_description?: string
          tools_used?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_challenge_cards_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_clubs: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          tags: string[] | null
          workshops_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          tags?: string[] | null
          workshops_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          tags?: string[] | null
          workshops_count?: number | null
        }
        Relationships: []
      }
      domain_directory: {
        Row: {
          avg_salary_usd: string | null
          category: string
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          growth_trajectory: string | null
          icon_emoji: string | null
          id: string
          industry: string | null
          interests: string[] | null
          keywords: string[] | null
          name: string
          parent_domain: string | null
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          sector: string | null
          soft_skills: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          category?: string
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          parent_domain?: string | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          sector?: string | null
          soft_skills?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          category?: string
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          parent_domain?: string | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          sector?: string | null
          soft_skills?: string[] | null
        }
        Relationships: []
      }
      domain_recommendations: {
        Row: {
          created_at: string
          description: string | null
          domain_name: string
          id: string
          match_score: number | null
          reasons: string[] | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_name: string
          id?: string
          match_score?: number | null
          reasons?: string[] | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_name?: string
          id?: string
          match_score?: number | null
          reasons?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_board_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_board_entries: {
        Row: {
          collection_id: string | null
          created_at: string
          entry_kind: string
          id: string
          metadata: Json
          note: string | null
          ref_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          entry_kind: string
          id?: string
          metadata?: Json
          note?: string | null
          ref_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          entry_kind?: string
          id?: string
          metadata?: Json
          note?: string | null
          ref_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_board_entries_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "dream_board_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_zones: {
        Row: {
          domain: string
          energy_level: number
          engagement_score: number | null
          id: string
          mood_after: string | null
          mood_before: string | null
          notes: string | null
          recorded_at: string
          task_type: string | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          domain: string
          energy_level?: number
          engagement_score?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          recorded_at?: string
          task_type?: string | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          domain?: string
          energy_level?: number
          engagement_score?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          recorded_at?: string
          task_type?: string | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      exam_gates: {
        Row: {
          code: string
          conducting_body: string | null
          created_at: string
          description: string | null
          difficulty_score: number | null
          eligibility_stage: Database["public"]["Enums"]["exam_stage"]
          frequency: string | null
          full_name: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          next_window: string | null
          official_url: string | null
          typical_prep_months: number | null
          updated_at: string
        }
        Insert: {
          code: string
          conducting_body?: string | null
          created_at?: string
          description?: string | null
          difficulty_score?: number | null
          eligibility_stage?: Database["public"]["Enums"]["exam_stage"]
          frequency?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          next_window?: string | null
          official_url?: string | null
          typical_prep_months?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          conducting_body?: string | null
          created_at?: string
          description?: string | null
          difficulty_score?: number | null
          eligibility_stage?: Database["public"]["Enums"]["exam_stage"]
          frequency?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          next_window?: string | null
          official_url?: string | null
          typical_prep_months?: number | null
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
      exploration_sessions: {
        Row: {
          ai_insights: Json | null
          domains_explored: string[] | null
          ended_at: string | null
          id: string
          mode: string | null
          mood_end: string | null
          mood_start: string | null
          session_type: string
          started_at: string
          total_interactions: number | null
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          domains_explored?: string[] | null
          ended_at?: string | null
          id?: string
          mode?: string | null
          mood_end?: string | null
          mood_start?: string | null
          session_type?: string
          started_at?: string
          total_interactions?: number | null
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          domains_explored?: string[] | null
          ended_at?: string | null
          id?: string
          mode?: string | null
          mood_end?: string | null
          mood_start?: string | null
          session_type?: string
          started_at?: string
          total_interactions?: number | null
          user_id?: string
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
      hackathon_participants: {
        Row: {
          hackathon_id: string
          id: string
          joined_at: string | null
          role: string | null
          team_name: string | null
          user_id: string
        }
        Insert: {
          hackathon_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          team_name?: string | null
          user_id: string
        }
        Update: {
          hackathon_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          team_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_participants_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "project_hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_pulse_snapshots: {
        Row: {
          id: string
          median_salary_inr: number | null
          metadata: Json
          new_postings: number
          open_postings: number
          role_id: string
          snapshot_at: string
          top_cities: Json
          top_companies: Json
          trend: string | null
          window_hours: number
        }
        Insert: {
          id?: string
          median_salary_inr?: number | null
          metadata?: Json
          new_postings?: number
          open_postings?: number
          role_id: string
          snapshot_at?: string
          top_cities?: Json
          top_companies?: Json
          trend?: string | null
          window_hours?: number
        }
        Update: {
          id?: string
          median_salary_inr?: number | null
          metadata?: Json
          new_postings?: number
          open_postings?: number
          role_id?: string
          snapshot_at?: string
          top_cities?: Json
          top_companies?: Json
          trend?: string | null
          window_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "hiring_pulse_snapshots_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
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
      identity_evaluations: {
        Row: {
          adaptability_score: number | null
          ai_feedback: Json | null
          collaboration_score: number | null
          confidence_score: number | null
          creativity_score: number | null
          emotional_intelligence_score: number | null
          evaluated_at: string
          evaluation_type: string
          id: string
          leadership_score: number | null
          overall_growth: number | null
          problem_solving_score: number | null
          reflection: string | null
          resilience_score: number | null
          user_id: string
        }
        Insert: {
          adaptability_score?: number | null
          ai_feedback?: Json | null
          collaboration_score?: number | null
          confidence_score?: number | null
          creativity_score?: number | null
          emotional_intelligence_score?: number | null
          evaluated_at?: string
          evaluation_type: string
          id?: string
          leadership_score?: number | null
          overall_growth?: number | null
          problem_solving_score?: number | null
          reflection?: string | null
          resilience_score?: number | null
          user_id: string
        }
        Update: {
          adaptability_score?: number | null
          ai_feedback?: Json | null
          collaboration_score?: number | null
          confidence_score?: number | null
          creativity_score?: number | null
          emotional_intelligence_score?: number | null
          evaluated_at?: string
          evaluation_type?: string
          id?: string
          leadership_score?: number | null
          overall_growth?: number | null
          problem_solving_score?: number | null
          reflection?: string | null
          resilience_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      industry_directory: {
        Row: {
          avg_salary_usd: string | null
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          growth_trajectory: string | null
          icon_emoji: string | null
          id: string
          interests: string[] | null
          keywords: string[] | null
          name: string
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          soft_skills: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Relationships: []
      }
      insights_submissions: {
        Row: {
          author_email: string | null
          author_name: string
          author_title: string | null
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          author_title?: string | null
          category: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt: string
          id?: string
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          author_title?: string | null
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inspiration_bookmarks: {
        Row: {
          collection_name: string | null
          created_at: string
          id: string
          note: string | null
          story_id: string
          user_id: string
        }
        Insert: {
          collection_name?: string | null
          created_at?: string
          id?: string
          note?: string | null
          story_id: string
          user_id: string
        }
        Update: {
          collection_name?: string | null
          created_at?: string
          id?: string
          note?: string | null
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_bookmarks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "inspiration_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "inspiration_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "inspiration_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_stories: {
        Row: {
          author_name: string | null
          author_role: string | null
          bookmarks_count: number | null
          category: string
          comments_count: number | null
          content: string
          created_at: string
          domain: string | null
          emotion_theme: string | null
          id: string
          intent: string | null
          is_approved: boolean | null
          is_featured: boolean | null
          likes_count: number | null
          scope: string | null
          stage: string | null
          story_type: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          author_role?: string | null
          bookmarks_count?: number | null
          category?: string
          comments_count?: number | null
          content: string
          created_at?: string
          domain?: string | null
          emotion_theme?: string | null
          id?: string
          intent?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          likes_count?: number | null
          scope?: string | null
          stage?: string | null
          story_type?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          author_role?: string | null
          bookmarks_count?: number | null
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          domain?: string | null
          emotion_theme?: string | null
          id?: string
          intent?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          likes_count?: number | null
          scope?: string | null
          stage?: string | null
          story_type?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inspire_wall_posts: {
        Row: {
          circle_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          likes_count: number | null
          post_type: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          circle_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          post_type?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          circle_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          post_type?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspire_wall_posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "peer_circles"
            referencedColumns: ["id"]
          },
        ]
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
      job_applications: {
        Row: {
          application_type: string | null
          applied_at: string | null
          company_challenge_id: string | null
          cover_note: string | null
          fit_breakdown: Json | null
          fit_score: number | null
          id: string
          notes: string | null
          opportunity_id: string | null
          reminder_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_type?: string | null
          applied_at?: string | null
          company_challenge_id?: string | null
          cover_note?: string | null
          fit_breakdown?: Json | null
          fit_score?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          reminder_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_type?: string | null
          applied_at?: string | null
          company_challenge_id?: string | null
          cover_note?: string | null
          fit_breakdown?: Json | null
          fit_score?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          reminder_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_company_challenge_id_fkey"
            columns: ["company_challenge_id"]
            isOneToOne: false
            referencedRelation: "company_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "job_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          employment_type: string | null
          experience_level: string | null
          id: string
          industry: string | null
          is_active: boolean
          location: string | null
          metadata: Json | null
          posted_at: string | null
          remote_type: string | null
          salary_max_inr: number | null
          salary_min_inr: number | null
          scraped_at: string
          skills: string[] | null
          source: string
          source_url: string
          title: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          posted_at?: string | null
          remote_type?: string | null
          salary_max_inr?: number | null
          salary_min_inr?: number | null
          scraped_at?: string
          skills?: string[] | null
          source: string
          source_url: string
          title: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          posted_at?: string | null
          remote_type?: string | null
          salary_max_inr?: number | null
          salary_min_inr?: number | null
          scraped_at?: string
          skills?: string[] | null
          source?: string
          source_url?: string
          title?: string
        }
        Relationships: []
      }
      job_opportunities: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          company_logo_url: string | null
          company_name: string
          created_at: string | null
          description: string | null
          domain: string | null
          duration: string | null
          experience_level: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          posted_at: string | null
          preferred_skills: string[] | null
          required_skills: string[] | null
          responsibilities: string[] | null
          role_type: string | null
          salary_range: string | null
          title: string
          work_mode: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          company_logo_url?: string | null
          company_name: string
          created_at?: string | null
          description?: string | null
          domain?: string | null
          duration?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          posted_at?: string | null
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          responsibilities?: string[] | null
          role_type?: string | null
          salary_range?: string | null
          title: string
          work_mode?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          company_logo_url?: string | null
          company_name?: string
          created_at?: string | null
          description?: string | null
          domain?: string | null
          duration?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          posted_at?: string | null
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          responsibilities?: string[] | null
          role_type?: string | null
          salary_range?: string | null
          title?: string
          work_mode?: string | null
        }
        Relationships: []
      }
      job_roles_directory: {
        Row: {
          avg_salary_usd: string | null
          career_path_keywords: string[] | null
          certifications: string[] | null
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          domain: string
          education_required: string | null
          growth_trajectory: string | null
          id: string
          industry: string | null
          interests: string[] | null
          keywords: string[] | null
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          sector: string | null
          seniority_levels: string[] | null
          skills_required: string[] | null
          soft_skills: string[] | null
          title: string
        }
        Insert: {
          avg_salary_usd?: string | null
          career_path_keywords?: string[] | null
          certifications?: string[] | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          domain?: string
          education_required?: string | null
          growth_trajectory?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          keywords?: string[] | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          sector?: string | null
          seniority_levels?: string[] | null
          skills_required?: string[] | null
          soft_skills?: string[] | null
          title: string
        }
        Update: {
          avg_salary_usd?: string | null
          career_path_keywords?: string[] | null
          certifications?: string[] | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          domain?: string
          education_required?: string | null
          growth_trajectory?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          keywords?: string[] | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          sector?: string | null
          seniority_levels?: string[] | null
          skills_required?: string[] | null
          soft_skills?: string[] | null
          title?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          intent: Database["public"]["Enums"]["user_intent"] | null
          is_private: boolean | null
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
          is_private?: boolean | null
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
          is_private?: boolean | null
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_insights: {
        Row: {
          ai_narrative: string | null
          created_at: string
          id: string
          insight_type: string
          mood_summary: Json | null
          patterns: Json | null
          period_end: string | null
          period_start: string | null
          suggestions: string[] | null
          user_id: string
        }
        Insert: {
          ai_narrative?: string | null
          created_at?: string
          id?: string
          insight_type?: string
          mood_summary?: Json | null
          patterns?: Json | null
          period_end?: string | null
          period_start?: string | null
          suggestions?: string[] | null
          user_id: string
        }
        Update: {
          ai_narrative?: string | null
          created_at?: string
          id?: string
          insight_type?: string
          mood_summary?: Json | null
          patterns?: Json | null
          period_end?: string | null
          period_start?: string | null
          suggestions?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      journal_shares: {
        Row: {
          entry_id: string
          id: string
          shared_at: string
          shared_with: string
          user_id: string
        }
        Insert: {
          entry_id: string
          id?: string
          shared_at?: string
          shared_with?: string
          user_id: string
        }
        Update: {
          entry_id?: string
          id?: string
          shared_at?: string
          shared_with?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_shares_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      ksao_dimensions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          family: Database["public"]["Enums"]["ksao_family"]
          id: string
          is_active: boolean
          name: string
          parent_code: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          family: Database["public"]["Enums"]["ksao_family"]
          id?: string
          is_active?: boolean
          name: string
          parent_code?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          family?: Database["public"]["Enums"]["ksao_family"]
          id?: string
          is_active?: boolean
          name?: string
          parent_code?: string | null
        }
        Relationships: []
      }
      lab_milestones: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          order_index: number | null
          plan_id: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          plan_id: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          plan_id?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_milestones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "lab_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_plans: {
        Row: {
          ai_feedback: Json | null
          created_at: string
          customer_segments: Json | null
          financial_plan: Json | null
          go_to_market: string | null
          id: string
          mission: string | null
          pitch_notes: string | null
          problem_statement: string | null
          revenue_model: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          value_proposition: string | null
          vision: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          created_at?: string
          customer_segments?: Json | null
          financial_plan?: Json | null
          go_to_market?: string | null
          id?: string
          mission?: string | null
          pitch_notes?: string | null
          problem_statement?: string | null
          revenue_model?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          value_proposition?: string | null
          vision?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          created_at?: string
          customer_segments?: Json | null
          financial_plan?: Json | null
          go_to_market?: string | null
          id?: string
          mission?: string | null
          pitch_notes?: string | null
          problem_statement?: string | null
          revenue_model?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          value_proposition?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          badge_count: number | null
          id: string
          learning_hours: number | null
          projects_completed: number | null
          rank_position: number | null
          scope: string | null
          scope_id: string | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_count?: number | null
          id?: string
          learning_hours?: number | null
          projects_completed?: number | null
          rank_position?: number | null
          scope?: string | null
          scope_id?: string | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_count?: number | null
          id?: string
          learning_hours?: number | null
          projects_completed?: number | null
          rank_position?: number | null
          scope?: string | null
          scope_id?: string | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_capsules: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          order_index: number | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      learning_track_modules: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          module_type: string | null
          order_index: number | null
          quiz: Json | null
          resources: Json | null
          title: string
          track_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_type?: string | null
          order_index?: number | null
          quiz?: Json | null
          resources?: Json | null
          title: string
          track_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_type?: string | null
          order_index?: number | null
          quiz?: Json | null
          resources?: Json | null
          title?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_modules_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "learning_tracks"
            referencedColumns: ["id"]
          },
        ]
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
      learning_tracks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          domain: string | null
          estimated_hours: number | null
          format: string | null
          icon_emoji: string | null
          id: string
          is_certification: boolean | null
          is_starter_pack: boolean | null
          order_index: number | null
          prerequisites: string[] | null
          skills_gained: string[] | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          estimated_hours?: number | null
          format?: string | null
          icon_emoji?: string | null
          id?: string
          is_certification?: boolean | null
          is_starter_pack?: boolean | null
          order_index?: number | null
          prerequisites?: string[] | null
          skills_gained?: string[] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          estimated_hours?: number | null
          format?: string | null
          icon_emoji?: string | null
          id?: string
          is_certification?: boolean | null
          is_starter_pack?: boolean | null
          order_index?: number | null
          prerequisites?: string[] | null
          skills_gained?: string[] | null
          title?: string
        }
        Relationships: []
      }
      mentor_bookmarks: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_bookmarks_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_nudges: {
        Row: {
          created_at: string
          id: string
          is_actioned: boolean | null
          is_read: boolean | null
          message: string
          nudge_type: string
          reason: string | null
          suggested_mentor_ids: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_actioned?: boolean | null
          is_read?: boolean | null
          message: string
          nudge_type: string
          reason?: string | null
          suggested_mentor_ids?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_actioned?: boolean | null
          is_read?: boolean | null
          message?: string
          nudge_type?: string
          reason?: string | null
          suggested_mentor_ids?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_reviews: {
        Row: {
          communication_score: number | null
          created_at: string
          expertise_score: number | null
          helpfulness_score: number | null
          id: string
          is_anonymous: boolean | null
          mentor_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          session_id: string | null
        }
        Insert: {
          communication_score?: number | null
          created_at?: string
          expertise_score?: number | null
          helpfulness_score?: number | null
          id?: string
          is_anonymous?: boolean | null
          mentor_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          session_id?: string | null
        }
        Update: {
          communication_score?: number | null
          created_at?: string
          expertise_score?: number | null
          helpfulness_score?: number | null
          id?: string
          is_anonymous?: boolean | null
          mentor_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_reviews_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_shares: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          mentor_id: string
          share_clarity: boolean | null
          share_energy: boolean | null
          share_evaluations: boolean | null
          share_patterns: boolean | null
          share_traits: boolean | null
          shared_sections: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mentor_id: string
          share_clarity?: boolean | null
          share_energy?: boolean | null
          share_evaluations?: boolean | null
          share_patterns?: boolean | null
          share_traits?: boolean | null
          shared_sections?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mentor_id?: string
          share_clarity?: boolean | null
          share_energy?: boolean | null
          share_evaluations?: boolean | null
          share_patterns?: boolean | null
          share_traits?: boolean | null
          shared_sections?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          achievements: string[] | null
          availability: string | null
          bio: string | null
          calendar_link: string | null
          created_at: string
          experience_years: number | null
          expertise_areas: string[] | null
          focus_areas: string[] | null
          id: string
          industries: string[] | null
          is_active: boolean | null
          is_verified: boolean | null
          linkedin_url: string | null
          mentee_focus: string | null
          name: string
          past_projects: Json | null
          profile_image_url: string | null
          rating: number | null
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          availability?: string | null
          bio?: string | null
          calendar_link?: string | null
          created_at?: string
          experience_years?: number | null
          expertise_areas?: string[] | null
          focus_areas?: string[] | null
          id?: string
          industries?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          mentee_focus?: string | null
          name: string
          past_projects?: Json | null
          profile_image_url?: string | null
          rating?: number | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          availability?: string | null
          bio?: string | null
          calendar_link?: string | null
          created_at?: string
          experience_years?: number | null
          expertise_areas?: string[] | null
          focus_areas?: string[] | null
          id?: string
          industries?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          mentee_focus?: string | null
          name?: string
          past_projects?: Json | null
          profile_image_url?: string | null
          rating?: number | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mentorship_interactions: {
        Row: {
          ai_insights: Json | null
          created_at: string
          id: string
          interaction_type: string
          mentor_id: string | null
          mood_after: string | null
          mood_before: string | null
          outcomes: string[] | null
          reflection: string | null
          session_id: string | null
          skills_discussed: string[] | null
          summary: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string
          id?: string
          interaction_type: string
          mentor_id?: string | null
          mood_after?: string | null
          mood_before?: string | null
          outcomes?: string[] | null
          reflection?: string | null
          session_id?: string | null
          skills_discussed?: string[] | null
          summary?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string
          id?: string
          interaction_type?: string
          mentor_id?: string | null
          mood_after?: string | null
          mood_before?: string | null
          outcomes?: string[] | null
          reflection?: string | null
          session_id?: string | null
          skills_discussed?: string[] | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_interactions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_pods: {
        Row: {
          created_at: string
          description: string | null
          domain: string | null
          id: string
          is_active: boolean | null
          is_moderated: boolean | null
          max_members: number | null
          member_count: number | null
          mentor_id: string | null
          name: string
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          is_moderated?: boolean | null
          max_members?: number | null
          member_count?: number | null
          mentor_id?: string | null
          name: string
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          is_moderated?: boolean | null
          max_members?: number | null
          member_count?: number | null
          mentor_id?: string | null
          name?: string
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_pods_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_requests: {
        Row: {
          created_at: string
          goals: string | null
          id: string
          mentee_id: string
          mentor_id: string
          message: string | null
          preferred_topics: string[] | null
          status: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          goals?: string | null
          id?: string
          mentee_id: string
          mentor_id: string
          message?: string | null
          preferred_topics?: string[] | null
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          goals?: string | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string | null
          preferred_topics?: string[] | null
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_recurring: boolean | null
          max_participants: number | null
          meeting_link: string | null
          mentor_id: string
          recurrence_pattern: string | null
          scheduled_at: string | null
          session_type: string
          status: string | null
          title: string
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          max_participants?: number | null
          meeting_link?: string | null
          mentor_id: string
          recurrence_pattern?: string | null
          scheduled_at?: string | null
          session_type?: string
          status?: string | null
          title: string
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          max_participants?: number | null
          meeting_link?: string | null
          mentor_id?: string
          recurrence_pattern?: string | null
          scheduled_at?: string | null
          session_type?: string
          status?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_celebrations: {
        Row: {
          celebration_data: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_seen: boolean | null
          milestone_type: string
          title: string
          user_id: string
        }
        Insert: {
          celebration_data?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_seen?: boolean | null
          milestone_type: string
          title: string
          user_id: string
        }
        Update: {
          celebration_data?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_seen?: boolean | null
          milestone_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
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
      mood_checkins: {
        Row: {
          challenges: string | null
          confidence_level: number | null
          created_at: string
          energy_level: number | null
          id: string
          mood: string
          notes: string | null
          triggers: string | null
          user_id: string
          wins: string | null
        }
        Insert: {
          challenges?: string | null
          confidence_level?: number | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mood: string
          notes?: string | null
          triggers?: string | null
          user_id: string
          wins?: string | null
        }
        Update: {
          challenges?: string | null
          confidence_level?: number | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string
          notes?: string | null
          triggers?: string | null
          user_id?: string
          wins?: string | null
        }
        Relationships: []
      }
      moodboard_items: {
        Row: {
          content: string
          content_type: string
          created_at: string
          emotional_note: string | null
          goal_tags: string[] | null
          id: string
          mood_feeling: string | null
          moodboard_id: string
          position_x: number | null
          position_y: number | null
          tags: string[] | null
          title: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          emotional_note?: string | null
          goal_tags?: string[] | null
          id?: string
          mood_feeling?: string | null
          moodboard_id: string
          position_x?: number | null
          position_y?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          emotional_note?: string | null
          goal_tags?: string[] | null
          id?: string
          mood_feeling?: string | null
          moodboard_id?: string
          position_x?: number | null
          position_y?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_items_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_shared: boolean | null
          tags: string[] | null
          theme: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          tags?: string[] | null
          theme?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          tags?: string[] | null
          theme?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mvp_experiments: {
        Row: {
          created_at: string
          feedback: string[] | null
          hypothesis: string | null
          id: string
          iteration_number: number
          learnings: string | null
          method: string | null
          metrics: Json | null
          project_id: string
          results: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string[] | null
          hypothesis?: string | null
          id?: string
          iteration_number?: number
          learnings?: string | null
          method?: string | null
          metrics?: Json | null
          project_id: string
          results?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string[] | null
          hypothesis?: string | null
          id?: string
          iteration_number?: number
          learnings?: string | null
          method?: string | null
          metrics?: Json | null
          project_id?: string
          results?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          learning_objectives: string[] | null
          metrics: Json | null
          order_index: number
          project_id: string
          status: string
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
          learning_objectives?: string[] | null
          metrics?: Json | null
          order_index?: number
          project_id: string
          status?: string
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
          learning_objectives?: string[] | null
          metrics?: Json | null
          order_index?: number
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string | null
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
      onboarding_rewards: {
        Row: {
          id: string
          milestone_percent: number
          reward_description: string | null
          reward_key: string
          reward_title: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          milestone_percent: number
          reward_description?: string | null
          reward_key: string
          reward_title: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          milestone_percent?: number
          reward_description?: string | null
          reward_key?: string
          reward_title?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      online_courses_directory: {
        Row: {
          avg_rating: string | null
          avg_salary_usd: string | null
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          difficulty: string | null
          domain: string | null
          duration: string | null
          growth_trajectory: string | null
          icon_emoji: string | null
          id: string
          interests: string[] | null
          keywords: string[] | null
          name: string
          platform: string | null
          price_range: string | null
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          soft_skills: string[] | null
          url: string | null
        }
        Insert: {
          avg_rating?: string | null
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          duration?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          platform?: string | null
          price_range?: string | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
          url?: string | null
        }
        Update: {
          avg_rating?: string | null
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          duration?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          platform?: string | null
          price_range?: string | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
          url?: string | null
        }
        Relationships: []
      }
      opportunity_reflections: {
        Row: {
          application_id: string | null
          content: string
          created_at: string | null
          id: string
          mood: string | null
          next_steps: string | null
          skills_to_build: string[] | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          mood?: string | null
          next_steps?: string | null
          skills_to_build?: string[] | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          mood?: string | null
          next_steps?: string | null
          skills_to_build?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_reflections_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_reminders: {
        Row: {
          company_challenge_id: string | null
          created_at: string | null
          id: string
          is_dismissed: boolean | null
          is_sent: boolean | null
          message: string | null
          opportunity_id: string | null
          reminder_date: string
          reminder_type: string
          user_id: string
        }
        Insert: {
          company_challenge_id?: string | null
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_sent?: boolean | null
          message?: string | null
          opportunity_id?: string | null
          reminder_date: string
          reminder_type?: string
          user_id: string
        }
        Update: {
          company_challenge_id?: string | null
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_sent?: boolean | null
          message?: string | null
          opportunity_id?: string | null
          reminder_date?: string
          reminder_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_reminders_company_challenge_id_fkey"
            columns: ["company_challenge_id"]
            isOneToOne: false
            referencedRelation: "company_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_reminders_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "job_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      path_community_shares: {
        Row: {
          created_at: string
          feedback_count: number | null
          id: string
          likes_count: number | null
          path_selection_id: string | null
          share_summary: string
          share_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_count?: number | null
          id?: string
          likes_count?: number | null
          path_selection_id?: string | null
          share_summary: string
          share_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_count?: number | null
          id?: string
          likes_count?: number | null
          path_selection_id?: string | null
          share_summary?: string
          share_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_community_shares_path_selection_id_fkey"
            columns: ["path_selection_id"]
            isOneToOne: false
            referencedRelation: "path_selections"
            referencedColumns: ["id"]
          },
        ]
      }
      path_reflections: {
        Row: {
          ai_feedback: Json | null
          created_at: string
          id: string
          mood: string | null
          path_selection_id: string | null
          prompt: string
          reflection_type: string
          response: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          created_at?: string
          id?: string
          mood?: string | null
          path_selection_id?: string | null
          prompt: string
          reflection_type?: string
          response?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          created_at?: string
          id?: string
          mood?: string | null
          path_selection_id?: string | null
          prompt?: string
          reflection_type?: string
          response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_reflections_path_selection_id_fkey"
            columns: ["path_selection_id"]
            isOneToOne: false
            referencedRelation: "path_selections"
            referencedColumns: ["id"]
          },
        ]
      }
      path_selections: {
        Row: {
          ai_analysis: Json | null
          confidence_score: number | null
          created_at: string
          description: string | null
          id: string
          path_type: string
          roadmap: Json | null
          signals: Json | null
          skills_matched: string[] | null
          skills_required: string[] | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          path_type: string
          roadmap?: Json | null
          signals?: Json | null
          skills_matched?: string[] | null
          skills_required?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          path_type?: string
          roadmap?: Json | null
          signals?: Json | null
          skills_matched?: string[] | null
          skills_required?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      path_share_feedback: {
        Row: {
          content: string
          created_at: string
          feedback_type: string
          id: string
          share_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback_type?: string
          id?: string
          share_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback_type?: string
          id?: string
          share_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_share_feedback_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "path_community_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      path_signal_snapshots: {
        Row: {
          confidence_delta: number | null
          created_at: string
          id: string
          path_selection_id: string | null
          signals_data: Json
          snapshot_type: string
          top_areas: string[] | null
          user_id: string
        }
        Insert: {
          confidence_delta?: number | null
          created_at?: string
          id?: string
          path_selection_id?: string | null
          signals_data?: Json
          snapshot_type?: string
          top_areas?: string[] | null
          user_id: string
        }
        Update: {
          confidence_delta?: number | null
          created_at?: string
          id?: string
          path_selection_id?: string | null
          signals_data?: Json
          snapshot_type?: string
          top_areas?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_signal_snapshots_path_selection_id_fkey"
            columns: ["path_selection_id"]
            isOneToOne: false
            referencedRelation: "path_selections"
            referencedColumns: ["id"]
          },
        ]
      }
      pathfinder_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          est_cost_inr: number | null
          est_months: number | null
          id: string
          kind: string
          metadata: Json
          ref_id: string | null
          route_id: string
          status: string
          step_order: number
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          est_cost_inr?: number | null
          est_months?: number | null
          id?: string
          kind: string
          metadata?: Json
          ref_id?: string | null
          route_id: string
          status?: string
          step_order: number
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          est_cost_inr?: number | null
          est_months?: number | null
          id?: string
          kind?: string
          metadata?: Json
          ref_id?: string | null
          route_id?: string
          status?: string
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathfinder_milestones_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "pathfinder_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      pathfinder_routes: {
        Row: {
          computed_at: string
          created_at: string
          flavor: Database["public"]["Enums"]["pathfinder_flavor"]
          id: string
          is_active: boolean
          route_data: Json
          success_score: number | null
          target_role_id: string
          total_cost_inr: number | null
          total_months: number | null
          user_id: string
        }
        Insert: {
          computed_at?: string
          created_at?: string
          flavor: Database["public"]["Enums"]["pathfinder_flavor"]
          id?: string
          is_active?: boolean
          route_data?: Json
          success_score?: number | null
          target_role_id: string
          total_cost_inr?: number | null
          total_months?: number | null
          user_id: string
        }
        Update: {
          computed_at?: string
          created_at?: string
          flavor?: Database["public"]["Enums"]["pathfinder_flavor"]
          id?: string
          is_active?: boolean
          route_data?: Json
          success_score?: number | null
          target_role_id?: string
          total_cost_inr?: number | null
          total_months?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathfinder_routes_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circle_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_circle_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_circle_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circle_engagement: {
        Row: {
          circle_id: string
          comments_count: number | null
          engagement_level: string | null
          id: string
          last_prompt_at: string | null
          mood_trend: string | null
          posts_count: number | null
          projects_joined: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          circle_id: string
          comments_count?: number | null
          engagement_level?: string | null
          id?: string
          last_prompt_at?: string | null
          mood_trend?: string | null
          posts_count?: number | null
          projects_joined?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          comments_count?: number | null
          engagement_level?: string | null
          id?: string
          last_prompt_at?: string | null
          mood_trend?: string | null
          posts_count?: number | null
          projects_joined?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_circle_engagement_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "peer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circle_members: {
        Row: {
          circle_id: string
          engagement_score: number | null
          id: string
          joined_at: string
          last_active_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          circle_id: string
          engagement_score?: number | null
          id?: string
          joined_at?: string
          last_active_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          engagement_score?: number | null
          id?: string
          joined_at?: string
          last_active_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "peer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circle_milestones: {
        Row: {
          achieved_at: string
          circle_id: string
          description: string | null
          id: string
          milestone_type: string | null
          title: string
        }
        Insert: {
          achieved_at?: string
          circle_id: string
          description?: string | null
          id?: string
          milestone_type?: string | null
          title: string
        }
        Update: {
          achieved_at?: string
          circle_id?: string
          description?: string | null
          id?: string
          milestone_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_circle_milestones_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "peer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circle_posts: {
        Row: {
          circle_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          post_type: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          circle_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_circle_posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "peer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circle_projects: {
        Row: {
          circle_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          difficulty: string | null
          id: string
          max_participants: number | null
          participant_count: number | null
          project_type: string
          skills_targeted: string[] | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          max_participants?: number | null
          participant_count?: number | null
          project_type?: string
          skills_targeted?: string[] | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          max_participants?: number | null
          participant_count?: number | null
          project_type?: string
          skills_targeted?: string[] | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_circle_projects_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "peer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_circles: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          domain: string
          experience_level: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          learning_focus: string | null
          max_members: number | null
          member_count: number | null
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string
          experience_level?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          learning_focus?: string | null
          max_members?: number | null
          member_count?: number | null
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string
          experience_level?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          learning_focus?: string | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      peer_endorsements: {
        Row: {
          achievement_id: string | null
          created_at: string | null
          endorsed_id: string
          endorsement_type: string | null
          endorser_id: string
          id: string
          message: string | null
        }
        Insert: {
          achievement_id?: string | null
          created_at?: string | null
          endorsed_id: string
          endorsement_type?: string | null
          endorser_id: string
          id?: string
          message?: string | null
        }
        Update: {
          achievement_id?: string | null
          created_at?: string | null
          endorsed_id?: string
          endorsement_type?: string | null
          endorser_id?: string
          id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_endorsements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_project_participants: {
        Row: {
          contribution_notes: string | null
          id: string
          joined_at: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          contribution_notes?: string | null
          id?: string
          joined_at?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          contribution_notes?: string | null
          id?: string
          joined_at?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "peer_circle_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pioneer_points: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          points: number
          reason: string
          ref_id: string | null
          ref_kind: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          points: number
          reason: string
          ref_id?: string | null
          ref_kind?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          points?: number
          reason?: string
          ref_id?: string | null
          ref_kind?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pod_discussions: {
        Row: {
          content: string
          created_at: string
          discussion_type: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          pod_id: string
          replies_count: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_type?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          pod_id: string
          replies_count?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_type?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          pod_id?: string
          replies_count?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_discussions_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "mentorship_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_members: {
        Row: {
          id: string
          joined_at: string
          pod_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          pod_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          pod_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "mentorship_pods"
            referencedColumns: ["id"]
          },
        ]
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
          academic_stream: string | null
          active_intent: Database["public"]["Enums"]["user_intent"] | null
          age: number | null
          age_group: string | null
          ai_comfort: string | null
          areas_of_focus: string[] | null
          avatar_url: string | null
          bio: string | null
          career_stage: string | null
          completion_percentage: number | null
          consent_data_usage: boolean | null
          consent_mentor_sharing: boolean | null
          created_at: string
          date_of_birth: string | null
          digital_comfort: string | null
          education_level: string | null
          full_name: string | null
          gender_identity: string | null
          highest_education: string | null
          id: string
          industry: string | null
          journey_responses: Json | null
          journey_variant: string | null
          life_stage: string | null
          location: string | null
          location_type: string | null
          long_term_goals: string | null
          mobile_number: string | null
          onboarding_status:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          preferred_language: string | null
          primary_device: string | null
          public_uid: string | null
          short_term_goals: string | null
          time_commitment: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          weekly_hours: string | null
        }
        Insert: {
          academic_stream?: string | null
          active_intent?: Database["public"]["Enums"]["user_intent"] | null
          age?: number | null
          age_group?: string | null
          ai_comfort?: string | null
          areas_of_focus?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          career_stage?: string | null
          completion_percentage?: number | null
          consent_data_usage?: boolean | null
          consent_mentor_sharing?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          digital_comfort?: string | null
          education_level?: string | null
          full_name?: string | null
          gender_identity?: string | null
          highest_education?: string | null
          id?: string
          industry?: string | null
          journey_responses?: Json | null
          journey_variant?: string | null
          life_stage?: string | null
          location?: string | null
          location_type?: string | null
          long_term_goals?: string | null
          mobile_number?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          preferred_language?: string | null
          primary_device?: string | null
          public_uid?: string | null
          short_term_goals?: string | null
          time_commitment?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          weekly_hours?: string | null
        }
        Update: {
          academic_stream?: string | null
          active_intent?: Database["public"]["Enums"]["user_intent"] | null
          age?: number | null
          age_group?: string | null
          ai_comfort?: string | null
          areas_of_focus?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          career_stage?: string | null
          completion_percentage?: number | null
          consent_data_usage?: boolean | null
          consent_mentor_sharing?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          digital_comfort?: string | null
          education_level?: string | null
          full_name?: string | null
          gender_identity?: string | null
          highest_education?: string | null
          id?: string
          industry?: string | null
          journey_responses?: Json | null
          journey_variant?: string | null
          life_stage?: string | null
          location?: string | null
          location_type?: string | null
          long_term_goals?: string | null
          mobile_number?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          preferred_language?: string | null
          primary_device?: string | null
          public_uid?: string | null
          short_term_goals?: string | null
          time_commitment?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          weekly_hours?: string | null
        }
        Relationships: []
      }
      project_challenges: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          domain: string
          duration_estimate: string | null
          expected_outcomes: string[] | null
          icon_emoji: string | null
          id: string
          is_featured: boolean | null
          learning_objectives: string[] | null
          points: number | null
          tags: string[] | null
          title: string
          tools_resources: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string
          duration_estimate?: string | null
          expected_outcomes?: string[] | null
          icon_emoji?: string | null
          id?: string
          is_featured?: boolean | null
          learning_objectives?: string[] | null
          points?: number | null
          tags?: string[] | null
          title: string
          tools_resources?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string
          duration_estimate?: string | null
          expected_outcomes?: string[] | null
          icon_emoji?: string | null
          id?: string
          is_featured?: boolean | null
          learning_objectives?: string[] | null
          points?: number | null
          tags?: string[] | null
          title?: string
          tools_resources?: string[] | null
        }
        Relationships: []
      }
      project_collaborators: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          project_id: string
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          project_id: string
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          project_id?: string
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          feedback_type: string | null
          id: string
          improvements: string | null
          project_id: string
          rating: number | null
          reviewee_id: string
          reviewer_id: string
          strengths: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          improvements?: string | null
          project_id: string
          rating?: number | null
          reviewee_id: string
          reviewer_id: string
          strengths?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          improvements?: string | null
          project_id?: string
          rating?: number | null
          reviewee_id?: string
          reviewer_id?: string
          strengths?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_hackathons: {
        Row: {
          created_at: string | null
          current_participants: number | null
          description: string | null
          difficulty: string | null
          domain: string | null
          end_date: string | null
          id: string
          is_team_based: boolean | null
          max_participants: number | null
          prizes: string[] | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          end_date?: string | null
          id?: string
          is_team_based?: boolean | null
          max_participants?: number | null
          prizes?: string[] | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          end_date?: string | null
          id?: string
          is_team_based?: boolean | null
          max_participants?: number | null
          prizes?: string[] | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      project_progress_logs: {
        Row: {
          created_at: string | null
          description: string | null
          energy_level: number | null
          id: string
          log_type: string | null
          mood: string | null
          project_id: string
          skills_practiced: string[] | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          energy_level?: number | null
          id?: string
          log_type?: string | null
          mood?: string | null
          project_id: string
          skills_practiced?: string[] | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          energy_level?: number | null
          id?: string
          log_type?: string | null
          mood?: string | null
          project_id?: string
          skills_practiced?: string[] | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progress_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reflections: {
        Row: {
          ai_feedback: Json | null
          challenges_faced: string | null
          content: string
          created_at: string | null
          energy_level: number | null
          id: string
          lessons_learned: string | null
          mood: string | null
          project_id: string
          reflection_type: string | null
          skills_developed: string[] | null
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          challenges_faced?: string | null
          content: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          lessons_learned?: string | null
          mood?: string | null
          project_id: string
          reflection_type?: string | null
          skills_developed?: string[] | null
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          challenges_faced?: string | null
          content?: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          lessons_learned?: string | null
          mood?: string | null
          project_id?: string
          reflection_type?: string | null
          skills_developed?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_reflections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          order_index: number | null
          priority: string | null
          project_id: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      reflection_prompts: {
        Row: {
          context: string | null
          created_at: string
          id: string
          insights_generated: Json | null
          mood_after: string | null
          prompt_text: string
          responded_at: string | null
          trigger_type: string | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          insights_generated?: Json | null
          mood_after?: string | null
          prompt_text: string
          responded_at?: string | null
          trigger_type?: string | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          insights_generated?: Json | null
          mood_after?: string | null
          prompt_text?: string
          responded_at?: string | null
          trigger_type?: string | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: []
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
      resume_exports: {
        Row: {
          achievements_snapshot: Json | null
          ai_insights: Json | null
          certifications_snapshot: Json | null
          created_at: string
          experiences_snapshot: Json | null
          id: string
          is_public: boolean | null
          projects_snapshot: Json | null
          share_token: string | null
          skills_snapshot: Json | null
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          achievements_snapshot?: Json | null
          ai_insights?: Json | null
          certifications_snapshot?: Json | null
          created_at?: string
          experiences_snapshot?: Json | null
          id?: string
          is_public?: boolean | null
          projects_snapshot?: Json | null
          share_token?: string | null
          skills_snapshot?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          achievements_snapshot?: Json | null
          ai_insights?: Json | null
          certifications_snapshot?: Json | null
          created_at?: string
          experiences_snapshot?: Json | null
          id?: string
          is_public?: boolean | null
          projects_snapshot?: Json | null
          share_token?: string | null
          skills_snapshot?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      reward_milestones: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          entitlement_key: string
          entitlement_type: string
          id: string
          is_active: boolean | null
          milestone_key: string
          milestone_percent: number
          reward_emoji: string | null
          test_type: string
          title: string
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          entitlement_key: string
          entitlement_type: string
          id?: string
          is_active?: boolean | null
          milestone_key: string
          milestone_percent: number
          reward_emoji?: string | null
          test_type: string
          title: string
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          entitlement_key?: string
          entitlement_type?: string
          id?: string
          is_active?: boolean | null
          milestone_key?: string
          milestone_percent?: number
          reward_emoji?: string | null
          test_type?: string
          title?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      reward_unlock_events: {
        Row: {
          acknowledged: boolean | null
          description: string | null
          id: string
          milestone_key: string
          milestone_percent: number | null
          reward_emoji: string | null
          test_type: string | null
          title: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          description?: string | null
          id?: string
          milestone_key: string
          milestone_percent?: number | null
          reward_emoji?: string | null
          test_type?: string | null
          title?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          description?: string | null
          id?: string
          milestone_key?: string
          milestone_percent?: number | null
          reward_emoji?: string | null
          test_type?: string | null
          title?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_step_details: {
        Row: {
          career_context: Json | null
          created_at: string
          difficulty_level: string | null
          generated_at: string
          guidance: Json | null
          id: string
          learning_resources: Json | null
          overview: string | null
          step_id: string
          sub_steps: Json | null
          time_breakdown: Json | null
          total_time_estimate: string | null
          user_id: string
        }
        Insert: {
          career_context?: Json | null
          created_at?: string
          difficulty_level?: string | null
          generated_at?: string
          guidance?: Json | null
          id?: string
          learning_resources?: Json | null
          overview?: string | null
          step_id: string
          sub_steps?: Json | null
          time_breakdown?: Json | null
          total_time_estimate?: string | null
          user_id: string
        }
        Update: {
          career_context?: Json | null
          created_at?: string
          difficulty_level?: string | null
          generated_at?: string
          guidance?: Json | null
          id?: string
          learning_resources?: Json | null
          overview?: string | null
          step_id?: string
          sub_steps?: Json | null
          time_breakdown?: Json | null
          total_time_estimate?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_step_details_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: true
            referencedRelation: "roadmap_steps"
            referencedColumns: ["id"]
          },
        ]
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
          ai_suggestions: Json | null
          created_at: string
          current_phase: string | null
          description: string | null
          id: string
          intent: Database["public"]["Enums"]["user_intent"]
          is_active: boolean | null
          long_term_goals: string | null
          short_term_goals: string | null
          skill_gaps: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          current_phase?: string | null
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"]
          is_active?: boolean | null
          long_term_goals?: string | null
          short_term_goals?: string | null
          skill_gaps?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          current_phase?: string | null
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["user_intent"]
          is_active?: boolean | null
          long_term_goals?: string | null
          short_term_goals?: string | null
          skill_gaps?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_education_edges: {
        Row: {
          created_at: string
          fit_score: number | null
          id: string
          notes: string | null
          program_id: string
          program_kind: string
          role_id: string
        }
        Insert: {
          created_at?: string
          fit_score?: number | null
          id?: string
          notes?: string | null
          program_id: string
          program_kind: string
          role_id: string
        }
        Update: {
          created_at?: string
          fit_score?: number | null
          id?: string
          notes?: string | null
          program_id?: string
          program_kind?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_education_edges_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_exam_gate_edges: {
        Row: {
          created_at: string
          gate_id: string
          id: string
          is_mandatory: boolean
          notes: string | null
          role_id: string
        }
        Insert: {
          created_at?: string
          gate_id: string
          id?: string
          is_mandatory?: boolean
          notes?: string | null
          role_id: string
        }
        Update: {
          created_at?: string
          gate_id?: string
          id?: string
          is_mandatory?: boolean
          notes?: string | null
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_exam_gate_edges_gate_id_fkey"
            columns: ["gate_id"]
            isOneToOne: false
            referencedRelation: "exam_gates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_exam_gate_edges_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_ksao_vectors: {
        Row: {
          created_at: string
          dimension_id: string
          id: string
          importance: number | null
          role_id: string
          source: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          dimension_id: string
          id?: string
          importance?: number | null
          role_id: string
          source?: string | null
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          dimension_id?: string
          id?: string
          importance?: number | null
          role_id?: string
          source?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_ksao_vectors_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "ksao_dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_ksao_vectors_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_role_edges: {
        Row: {
          created_at: string
          edge_type: Database["public"]["Enums"]["role_edge_type"]
          from_role_id: string
          id: string
          rationale: string | null
          source: string | null
          to_role_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          edge_type: Database["public"]["Enums"]["role_edge_type"]
          from_role_id: string
          id?: string
          rationale?: string | null
          source?: string | null
          to_role_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          edge_type?: Database["public"]["Enums"]["role_edge_type"]
          from_role_id?: string
          id?: string
          rationale?: string | null
          source?: string | null
          to_role_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_role_edges_from_role_id_fkey"
            columns: ["from_role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_role_edges_to_role_id_fkey"
            columns: ["to_role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_views_log: {
        Row: {
          created_at: string
          dwell_ms: number | null
          id: string
          role_id: string
          source: string | null
          tab: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dwell_ms?: number | null
          id?: string
          role_id: string
          source?: string | null
          tab?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dwell_ms?: number | null
          id?: string
          role_id?: string
          source?: string | null
          tab?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_views_log_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_opportunities: {
        Row: {
          career_path_id: string | null
          company_challenge_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          opportunity_id: string | null
          save_type: string | null
          user_id: string
        }
        Insert: {
          career_path_id?: string | null
          company_challenge_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          save_type?: string | null
          user_id: string
        }
        Update: {
          career_path_id?: string | null
          company_challenge_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          save_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_opportunities_company_challenge_id_fkey"
            columns: ["company_challenge_id"]
            isOneToOne: false
            referencedRelation: "company_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "job_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_directory: {
        Row: {
          avg_salary_usd: string | null
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          growth_trajectory: string | null
          icon_emoji: string | null
          id: string
          industry_id: string | null
          industry_name: string | null
          interests: string[] | null
          keywords: string[] | null
          name: string
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          soft_skills: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          industry_id?: string | null
          industry_name?: string | null
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          icon_emoji?: string | null
          id?: string
          industry_id?: string | null
          industry_name?: string | null
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_directory_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_directory"
            referencedColumns: ["id"]
          },
        ]
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
      selfgraph_traits: {
        Row: {
          confidence: number | null
          created_at: string
          evidence: Json | null
          id: string
          score: number
          source: string | null
          trait_category: string
          trait_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          score?: number
          source?: string | null
          trait_category?: string
          trait_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          score?: number
          source?: string | null
          trait_category?: string
          trait_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_participants: {
        Row: {
          id: string
          joined_at: string | null
          notes: string | null
          session_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          notes?: string | null
          session_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          notes?: string | null
          session_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_collaborations: {
        Row: {
          created_at: string
          id: string
          message: string | null
          owner_id: string
          project_id: string
          requester_id: string
          skills_offered: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          owner_id: string
          project_id: string
          requester_id: string
          skills_offered?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          owner_id?: string
          project_id?: string
          requester_id?: string
          skills_offered?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_collaborations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_reactions: {
        Row: {
          created_at: string
          id: string
          project_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_reactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_challenges: {
        Row: {
          category: string | null
          constraints: Json | null
          created_at: string
          difficulty: string | null
          id: string
          learning_outcome: string | null
          options: Json | null
          points: number | null
          scenario: string
          title: string
        }
        Insert: {
          category?: string | null
          constraints?: Json | null
          created_at?: string
          difficulty?: string | null
          id?: string
          learning_outcome?: string | null
          options?: Json | null
          points?: number | null
          scenario: string
          title: string
        }
        Update: {
          category?: string | null
          constraints?: Json | null
          created_at?: string
          difficulty?: string | null
          id?: string
          learning_outcome?: string | null
          options?: Json | null
          points?: number | null
          scenario?: string
          title?: string
        }
        Relationships: []
      }
      skill_application_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          outcome: string | null
          skill_item_id: string
          status: string | null
          task_type: string | null
          time_spent_minutes: number | null
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          outcome?: string | null
          skill_item_id: string
          status?: string | null
          task_type?: string | null
          time_spent_minutes?: number | null
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          outcome?: string | null
          skill_item_id?: string
          status?: string | null
          task_type?: string | null
          time_spent_minutes?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_application_tasks_skill_item_id_fkey"
            columns: ["skill_item_id"]
            isOneToOne: false
            referencedRelation: "skill_items"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_applications: {
        Row: {
          applicable_domains: string[] | null
          applicable_roles: string[] | null
          created_at: string
          demand_level: string | null
          growth_potential: string | null
          id: string
          project_ideas: string[] | null
          skill_name: string
          startup_applications: string[] | null
        }
        Insert: {
          applicable_domains?: string[] | null
          applicable_roles?: string[] | null
          created_at?: string
          demand_level?: string | null
          growth_potential?: string | null
          id?: string
          project_ideas?: string[] | null
          skill_name: string
          startup_applications?: string[] | null
        }
        Update: {
          applicable_domains?: string[] | null
          applicable_roles?: string[] | null
          created_at?: string
          demand_level?: string | null
          growth_potential?: string | null
          id?: string
          project_ideas?: string[] | null
          skill_name?: string
          startup_applications?: string[] | null
        }
        Relationships: []
      }
      skill_checkpoints: {
        Row: {
          confidence_after: number | null
          confidence_before: number | null
          created_at: string
          energy_level: string | null
          id: string
          paused: boolean | null
          reflection: string | null
          skill_item_id: string
          user_id: string
          went_deeper: boolean | null
        }
        Insert: {
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          energy_level?: string | null
          id?: string
          paused?: boolean | null
          reflection?: string | null
          skill_item_id: string
          user_id: string
          went_deeper?: boolean | null
        }
        Update: {
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          energy_level?: string | null
          id?: string
          paused?: boolean | null
          reflection?: string | null
          skill_item_id?: string
          user_id?: string
          went_deeper?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_checkpoints_skill_item_id_fkey"
            columns: ["skill_item_id"]
            isOneToOne: false
            referencedRelation: "skill_items"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_fit_analysis: {
        Row: {
          created_at: string
          id: string
          is_eligible: boolean | null
          match_score: number | null
          recommendations: Json | null
          role_name: string
          role_type: string
          skills_matched: string[] | null
          skills_missing: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_eligible?: boolean | null
          match_score?: number | null
          recommendations?: Json | null
          role_name: string
          role_type: string
          skills_matched?: string[] | null
          skills_missing?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_eligible?: boolean | null
          match_score?: number | null
          recommendations?: Json | null
          role_name?: string
          role_type?: string
          skills_matched?: string[] | null
          skills_missing?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_items: {
        Row: {
          accepted_at: string | null
          category: string
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          effort_level: string | null
          energy_feedback: string | null
          id: string
          learning_capsule_ids: string[] | null
          order_index: number | null
          project_ids: string[] | null
          skill_name: string
          stack_id: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          where_it_applies: string[] | null
          why_it_matters: string | null
        }
        Insert: {
          accepted_at?: string | null
          category?: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          effort_level?: string | null
          energy_feedback?: string | null
          id?: string
          learning_capsule_ids?: string[] | null
          order_index?: number | null
          project_ids?: string[] | null
          skill_name: string
          stack_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          where_it_applies?: string[] | null
          why_it_matters?: string | null
        }
        Update: {
          accepted_at?: string | null
          category?: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          effort_level?: string | null
          energy_feedback?: string | null
          id?: string
          learning_capsule_ids?: string[] | null
          order_index?: number | null
          project_ids?: string[] | null
          skill_name?: string
          stack_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          where_it_applies?: string[] | null
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_items_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "skill_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_opportunity_map: {
        Row: {
          created_at: string
          id: string
          missing_skills: string[] | null
          opportunity_title: string
          opportunity_type: string
          readiness_score: number | null
          skill_item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          missing_skills?: string[] | null
          opportunity_title: string
          opportunity_type: string
          readiness_score?: number | null
          skill_item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          missing_skills?: string[] | null
          opportunity_title?: string
          opportunity_type?: string
          readiness_score?: number | null
          skill_item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_opportunity_map_skill_item_id_fkey"
            columns: ["skill_item_id"]
            isOneToOne: false
            referencedRelation: "skill_items"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_stacks: {
        Row: {
          ai_generated: boolean | null
          based_on_path: string | null
          completed_skills: number | null
          created_at: string
          domain: string
          id: string
          status: string
          title: string
          total_skills: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          based_on_path?: string | null
          completed_skills?: number | null
          created_at?: string
          domain?: string
          id?: string
          status?: string
          title: string
          total_skills?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          based_on_path?: string | null
          completed_skills?: number | null
          created_at?: string
          domain?: string
          id?: string
          status?: string
          title?: string
          total_skills?: number | null
          updated_at?: string
          user_id?: string
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
      skills_directory: {
        Row: {
          avg_salary_usd: string | null
          category: string | null
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          domain: string | null
          growth_trajectory: string | null
          id: string
          interests: string[] | null
          keywords: string[] | null
          name: string
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          soft_skills: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          category?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          domain?: string | null
          growth_trajectory?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          category?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          domain?: string | null
          growth_trajectory?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
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
      startup_playbooks: {
        Row: {
          case_study: string | null
          checklist: Json | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          phase: string
          steps: Json | null
          tags: string[] | null
          title: string
        }
        Insert: {
          case_study?: string | null
          checklist?: Json | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          phase?: string
          steps?: Json | null
          tags?: string[] | null
          title: string
        }
        Update: {
          case_study?: string | null
          checklist?: Json | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          phase?: string
          steps?: Json | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      story_behavior_analysis: {
        Row: {
          ai_summary: string | null
          analysis_type: string
          analyzed_at: string
          career_inclinations: Json | null
          confidence_score: number | null
          domains_attracted: string[] | null
          domains_rejected: string[] | null
          id: string
          personality_signals: Json | null
          skills_resonated: string[] | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          analysis_type?: string
          analyzed_at?: string
          career_inclinations?: Json | null
          confidence_score?: number | null
          domains_attracted?: string[] | null
          domains_rejected?: string[] | null
          id?: string
          personality_signals?: Json | null
          skills_resonated?: string[] | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          analysis_type?: string
          analyzed_at?: string
          career_inclinations?: Json | null
          confidence_score?: number | null
          domains_attracted?: string[] | null
          domains_rejected?: string[] | null
          id?: string
          personality_signals?: Json | null
          skills_resonated?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      subjects_directory: {
        Row: {
          avg_salary_usd: string | null
          countries_in_demand: string[] | null
          created_at: string | null
          demand_level: string | null
          description: string | null
          domain: string | null
          growth_trajectory: string | null
          id: string
          interests: string[] | null
          keywords: string[] | null
          name: string
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          related_universities: string[] | null
          soft_skills: string[] | null
        }
        Insert: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          domain?: string | null
          growth_trajectory?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Update: {
          avg_salary_usd?: string | null
          countries_in_demand?: string[] | null
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          domain?: string | null
          growth_trajectory?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          related_universities?: string[] | null
          soft_skills?: string[] | null
        }
        Relationships: []
      }
      suggested_roadmaps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          match_score: number | null
          reasoning: string[] | null
          roadmap_data: Json | null
          source_module: string | null
          source_signals: Json | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          match_score?: number | null
          reasoning?: string[] | null
          roadmap_data?: Json | null
          source_module?: string | null
          source_signals?: Json | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          match_score?: number | null
          reasoning?: string[] | null
          roadmap_data?: Json | null
          source_module?: string | null
          source_signals?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_nudges: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          nudge_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          nudge_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          nudge_type?: string
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          action_plan: Json | null
          ai_guidance: Json | null
          category: string
          challenge: string
          created_at: string
          id: string
          mood: string | null
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          action_plan?: Json | null
          ai_guidance?: Json | null
          category: string
          challenge: string
          created_at?: string
          id?: string
          mood?: string | null
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action_plan?: Json | null
          ai_guidance?: Json | null
          category?: string
          challenge?: string
          created_at?: string
          id?: string
          mood?: string | null
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      taxonomy_nodes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["taxonomy_level"]
          metadata: Json
          name: string
          parent_id: string | null
          slug: string
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level: Database["public"]["Enums"]["taxonomy_level"]
          metadata?: Json
          name: string
          parent_id?: string | null
          slug: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["taxonomy_level"]
          metadata?: Json
          name?: string
          parent_id?: string | null
          slug?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_sessions: {
        Row: {
          context_snapshot: Json | null
          created_at: string
          id: string
          last_message_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_snapshot?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_snapshot?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transition_paths: {
        Row: {
          bridge_skills: string[] | null
          created_at: string
          demand_data: Json | null
          description: string | null
          id: string
          income_risk: string | null
          is_selected: boolean | null
          lifestyle_impact: string | null
          path_type: string
          plan_id: string
          roadmap_steps: Json | null
          skills_needed: string[] | null
          time_required: string | null
          title: string
          user_id: string
        }
        Insert: {
          bridge_skills?: string[] | null
          created_at?: string
          demand_data?: Json | null
          description?: string | null
          id?: string
          income_risk?: string | null
          is_selected?: boolean | null
          lifestyle_impact?: string | null
          path_type?: string
          plan_id: string
          roadmap_steps?: Json | null
          skills_needed?: string[] | null
          time_required?: string | null
          title: string
          user_id: string
        }
        Update: {
          bridge_skills?: string[] | null
          created_at?: string
          demand_data?: Json | null
          description?: string | null
          id?: string
          income_risk?: string | null
          is_selected?: boolean | null
          lifestyle_impact?: string | null
          path_type?: string
          plan_id?: string
          roadmap_steps?: Json | null
          skills_needed?: string[] | null
          time_required?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transition_paths_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "transition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_plans: {
        Row: {
          created_at: string
          current_pain_points: string[] | null
          id: string
          readiness_assessment: Json | null
          readiness_level: string | null
          reality_mapping: Json | null
          status: string
          timeline_insights: Json | null
          transferable_skills: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_pain_points?: string[] | null
          id?: string
          readiness_assessment?: Json | null
          readiness_level?: string | null
          reality_mapping?: Json | null
          status?: string
          timeline_insights?: Json | null
          transferable_skills?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_pain_points?: string[] | null
          id?: string
          readiness_assessment?: Json | null
          readiness_level?: string | null
          reality_mapping?: Json | null
          status?: string
          timeline_insights?: Json | null
          transferable_skills?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transition_reflections: {
        Row: {
          ai_response: Json | null
          content: string
          created_at: string
          id: string
          mood: string | null
          plan_id: string | null
          reflection_type: string
          user_id: string
        }
        Insert: {
          ai_response?: Json | null
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          plan_id?: string | null
          reflection_type?: string
          user_id: string
        }
        Update: {
          ai_response?: Json | null
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          plan_id?: string | null
          reflection_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transition_reflections_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "transition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      universities_directory: {
        Row: {
          avg_salary_usd: string | null
          city: string | null
          continent: string | null
          country: string
          created_at: string | null
          demand_level: string | null
          description: string | null
          growth_trajectory: string | null
          id: string
          interests: string[] | null
          keywords: string[] | null
          name: string
          popular_courses: string[] | null
          ranking_tier: string | null
          related_careers: string[] | null
          related_countries: string[] | null
          related_courses: string[] | null
          related_domains: string[] | null
          related_industries: string[] | null
          related_job_roles: string[] | null
          related_sectors: string[] | null
          related_skills: string[] | null
          related_subjects: string[] | null
          soft_skills: string[] | null
          type: string | null
          website: string | null
        }
        Insert: {
          avg_salary_usd?: string | null
          city?: string | null
          continent?: string | null
          country: string
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name: string
          popular_courses?: string[] | null
          ranking_tier?: string | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          soft_skills?: string[] | null
          type?: string | null
          website?: string | null
        }
        Update: {
          avg_salary_usd?: string | null
          city?: string | null
          continent?: string | null
          country?: string
          created_at?: string | null
          demand_level?: string | null
          description?: string | null
          growth_trajectory?: string | null
          id?: string
          interests?: string[] | null
          keywords?: string[] | null
          name?: string
          popular_courses?: string[] | null
          ranking_tier?: string | null
          related_careers?: string[] | null
          related_countries?: string[] | null
          related_courses?: string[] | null
          related_domains?: string[] | null
          related_industries?: string[] | null
          related_job_roles?: string[] | null
          related_sectors?: string[] | null
          related_skills?: string[] | null
          related_subjects?: string[] | null
          soft_skills?: string[] | null
          type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      university_programs: {
        Row: {
          career_path_keywords: string[] | null
          created_at: string | null
          degree_type: string
          department: string | null
          domain_keywords: string[] | null
          duration_years: number | null
          id: string
          job_role_keywords: string[] | null
          keywords: string[] | null
          program_name: string
          university_id: string
        }
        Insert: {
          career_path_keywords?: string[] | null
          created_at?: string | null
          degree_type?: string
          department?: string | null
          domain_keywords?: string[] | null
          duration_years?: number | null
          id?: string
          job_role_keywords?: string[] | null
          keywords?: string[] | null
          program_name: string
          university_id: string
        }
        Update: {
          career_path_keywords?: string[] | null
          created_at?: string | null
          degree_type?: string
          department?: string | null
          domain_keywords?: string[] | null
          duration_years?: number | null
          id?: string
          job_role_keywords?: string[] | null
          keywords?: string[] | null
          program_name?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      user_entitlements: {
        Row: {
          entitlement_key: string
          entitlement_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          source: string | null
          source_milestone_key: string | null
          unlocked_at: string
          usage_count: number | null
          usage_limit: number | null
          user_id: string
        }
        Insert: {
          entitlement_key: string
          entitlement_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          source?: string | null
          source_milestone_key?: string | null
          unlocked_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_id: string
        }
        Update: {
          entitlement_key?: string
          entitlement_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          source?: string | null
          source_milestone_key?: string | null
          unlocked_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_ksao_vectors: {
        Row: {
          confidence: number
          dimension_id: string
          id: string
          last_signal_at: string | null
          score: number
          sources: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          dimension_id: string
          id?: string
          last_signal_at?: string | null
          score?: number
          sources?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          dimension_id?: string
          id?: string
          last_signal_at?: string | null
          score?: number
          sources?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ksao_vectors_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "ksao_dimensions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          notes: string | null
          score: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          notes?: string | null
          score?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          score?: number | null
          status?: string | null
          user_id?: string
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
      user_signals: {
        Row: {
          created_at: string
          id: string
          signal_context: Json | null
          signal_source: string
          signal_type: string
          signal_value: string
          strength: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          signal_context?: Json | null
          signal_source: string
          signal_type?: string
          signal_value: string
          strength?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          signal_context?: Json | null
          signal_source?: string
          signal_type?: string
          signal_value?: string
          strength?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          started_at: string | null
          streak_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          started_at?: string | null
          streak_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          started_at?: string | null
          streak_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      validation_sprints: {
        Row: {
          actual_responses: number | null
          completed_at: string | null
          created_at: string
          findings: string | null
          hypothesis: string | null
          id: string
          method: string | null
          plan_id: string
          sprint_duration_days: number | null
          started_at: string | null
          status: string
          target_responses: number | null
          title: string
          user_id: string
          validated: boolean | null
        }
        Insert: {
          actual_responses?: number | null
          completed_at?: string | null
          created_at?: string
          findings?: string | null
          hypothesis?: string | null
          id?: string
          method?: string | null
          plan_id: string
          sprint_duration_days?: number | null
          started_at?: string | null
          status?: string
          target_responses?: number | null
          title: string
          user_id: string
          validated?: boolean | null
        }
        Update: {
          actual_responses?: number | null
          completed_at?: string | null
          created_at?: string
          findings?: string | null
          hypothesis?: string | null
          id?: string
          method?: string | null
          plan_id?: string
          sprint_duration_days?: number | null
          started_at?: string | null
          status?: string
          target_responses?: number | null
          title?: string
          user_id?: string
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_sprints_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "lab_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_digests: {
        Row: {
          ai_summary: string | null
          challenges_faced: string[] | null
          created_at: string
          domain_shifts: Json | null
          energy_patterns: Json | null
          id: string
          key_achievements: string[] | null
          mood_summary: Json | null
          recommendations: Json | null
          skills_progress: Json | null
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          ai_summary?: string | null
          challenges_faced?: string[] | null
          created_at?: string
          domain_shifts?: Json | null
          energy_patterns?: Json | null
          id?: string
          key_achievements?: string[] | null
          mood_summary?: Json | null
          recommendations?: Json | null
          skills_progress?: Json | null
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          ai_summary?: string | null
          challenges_faced?: string[] | null
          created_at?: string
          domain_shifts?: Json | null
          energy_patterns?: Json | null
          id?: string
          key_achievements?: string[] | null
          mood_summary?: Json | null
          recommendations?: Json | null
          skills_progress?: Json | null
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_insights: {
        Row: {
          author_name: string | null
          author_title: string | null
          category: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          author_name?: string | null
          author_title?: string | null
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          author_name?: string | null
          author_title?: string | null
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      consume_entitlement: {
        Args: { _entitlement_key: string }
        Returns: boolean
      }
      ensure_profile_public_uid: { Args: never; Returns: string }
      has_active_entitlement: {
        Args: { _entitlement_key: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_email_verified: { Args: { _email: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unlock_reward: { Args: { _milestone_key: string }; Returns: Json }
      update_assessment_progress: {
        Args: { _completed: number; _test_type: string; _total: number }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      connection_status: "pending" | "accepted" | "declined"
      exam_stage: "class_10" | "class_12" | "ug" | "pg" | "post_pg" | "any"
      ksao_family:
        | "knowledge"
        | "skill"
        | "cognitive"
        | "curiosity"
        | "value"
        | "personality"
      onboarding_status:
        | "welcome"
        | "user_type"
        | "intent"
        | "complete"
        | "personal_info"
        | "consent"
      pathfinder_flavor: "fastest" | "safest" | "no_cost"
      project_status: "idea" | "planning" | "building" | "launched" | "archived"
      roadmap_step_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "skipped"
      role_edge_type: "similar" | "progression" | "pivot" | "cluster_mediated"
      taxonomy_level:
        | "sector"
        | "sub_sector"
        | "industry_family"
        | "industry"
        | "domain"
        | "sub_domain"
        | "function"
        | "job_family"
        | "career_cluster"
        | "career_pathway_cluster"
        | "role"
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
      exam_stage: ["class_10", "class_12", "ug", "pg", "post_pg", "any"],
      ksao_family: [
        "knowledge",
        "skill",
        "cognitive",
        "curiosity",
        "value",
        "personality",
      ],
      onboarding_status: [
        "welcome",
        "user_type",
        "intent",
        "complete",
        "personal_info",
        "consent",
      ],
      pathfinder_flavor: ["fastest", "safest", "no_cost"],
      project_status: ["idea", "planning", "building", "launched", "archived"],
      roadmap_step_status: [
        "not_started",
        "in_progress",
        "completed",
        "skipped",
      ],
      role_edge_type: ["similar", "progression", "pivot", "cluster_mediated"],
      taxonomy_level: [
        "sector",
        "sub_sector",
        "industry_family",
        "industry",
        "domain",
        "sub_domain",
        "function",
        "job_family",
        "career_cluster",
        "career_pathway_cluster",
        "role",
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
