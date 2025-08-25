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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          created_at: string
          firebase_uid: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          firebase_uid?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          firebase_uid?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      compliance_issues: {
        Row: {
          issue_id: string
          record_id: number
          issue_type: string
          description: string | null
          entity: string
          severity: 'Low' | 'Medium' | 'High' | 'Critical' | null
          status: 'Open' | 'In Progress' | 'Closed' | null
          assignee: string | null
          date_created: string | null
          insights_system_description: string | null
          insights_summary: string | null
          insights_recommendations: any | null
          insights_risk_level: 'low' | 'medium' | 'high' | null
          insights_confidence: number | null
          insights_model: string | null
          insights_generated_at: string | null
          date_resolved: string | null
          resolution_notes: string | null
          resolution_action: string | null
        }
        Insert: {
          issue_id: string
          record_id: number
          issue_type: string
          description?: string | null
          entity: string
          severity?: 'Low' | 'Medium' | 'High' | 'Critical' | null
          status?: 'Open' | 'In Progress' | 'Closed' | null
          assignee?: string | null
          date_created?: string | null
          insights_system_description?: string | null
          insights_summary?: string | null
          insights_recommendations?: any | null
          insights_risk_level?: 'low' | 'medium' | 'high' | null
          insights_confidence?: number | null
          insights_model?: string | null
          insights_generated_at?: string | null
          date_resolved?: string | null
          resolution_notes?: string | null
          resolution_action?: string | null
        }
        Update: {
          issue_id?: string
          record_id?: number
          issue_type?: string
          description?: string | null
          entity?: string
          severity?: 'Low' | 'Medium' | 'High' | 'Critical' | null
          status?: 'Open' | 'In Progress' | 'Closed' | null
          assignee?: string | null
          date_created?: string | null
          insights_system_description?: string | null
          insights_summary?: string | null
          insights_recommendations?: any | null
          insights_risk_level?: 'low' | 'medium' | 'high' | null
          insights_confidence?: number | null
          insights_model?: string | null
          insights_generated_at?: string | null
          date_resolved?: string | null
          resolution_notes?: string | null
          resolution_action?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_organizations: {
        Row: {
          added_at: string
          firebase_uid: string
          org_id: string
          org_role: string
        }
        Insert: {
          added_at?: string
          firebase_uid: string
          org_id: string
          org_role?: string
        }
        Update: {
          added_at?: string
          firebase_uid?: string
          org_id?: string
          org_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_uid_fkey"
            columns: ["firebase_uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["firebase_uid"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          email_verified: boolean | null
          firebase_uid: string
          last_login_at: string | null
          name: string | null
          password: string | null
          provider: string | null
          role: 'dataTeam' | 'teamLead' | 'dataTeamLead'
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          firebase_uid: string
          last_login_at?: string | null
          name?: string | null
          password?: string | null
          provider?: string | null
          role?: 'dataTeam' | 'teamLead' | 'dataTeamLead'
        }
        Update: {
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          firebase_uid?: string
          last_login_at?: string | null
          name?: string | null
          password?: string | null
          provider?: string | null
          role?: 'dataTeam' | 'teamLead' | 'dataTeamLead'
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          firebase_uid: string | null
          name: string
          email: string
          role: 'data_analyst' | 'data_steward' | 'senior_analyst' | 'team_lead'
          status: 'active' | 'inactive' | 'pending'
          last_active: string | null
          assigned_issues: number
          performance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firebase_uid?: string | null
          name: string
          email: string
          role?: 'data_analyst' | 'data_steward' | 'senior_analyst' | 'team_lead'
          status?: 'active' | 'inactive' | 'pending'
          last_active?: string | null
          assigned_issues?: number
          performance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firebase_uid?: string | null
          name?: string
          email?: string
          role?: 'data_analyst' | 'data_steward' | 'senior_analyst' | 'team_lead'
          status?: 'active' | 'inactive' | 'pending'
          last_active?: string | null
          assigned_issues?: number
          performance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_firebase_uid_fkey"
            columns: ["firebase_uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["firebase_uid"]
          }
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string
          permissions: string[]
          member_count: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          permissions: string[]
          member_count?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          permissions?: string[]
          member_count?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          id: string
          firebase_uid: string | null
          dashboard_type: string
          executive_summary: string | null
          high_priority_recommendations: string[] | null
          medium_priority_actions: string[] | null
          strategic_opportunities: string[] | null
          impact_data: Json | null
          insights_count: number
          generation_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firebase_uid?: string | null
          dashboard_type?: string
          executive_summary?: string | null
          high_priority_recommendations?: string[] | null
          medium_priority_actions?: string[] | null
          strategic_opportunities?: string[] | null
          impact_data?: Json | null
          insights_count?: number
          generation_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firebase_uid?: string | null
          dashboard_type?: string
          executive_summary?: string | null
          high_priority_recommendations?: string[] | null
          medium_priority_actions?: string[] | null
          strategic_opportunities?: string[] | null
          impact_data?: Json | null
          insights_count?: number
          generation_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_firebase_uid_fkey"
            columns: ["firebase_uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["firebase_uid"]
          }
        ]
      }
      data_glossary: {
        Row: {
          id: number
          term: string
          definition: string
          source_columns: string[] | null
          data_types: string[] | null
          sample_values: string[] | null
          synonyms: string[] | null
          category: string | null
          confidence: number | null
          dataset_id: string
          created_at: string | null
          updated_at: string | null
          source_file_id: string | null
          source_filename: string | null
        }
        Insert: {
          id?: number
          term: string
          definition: string
          source_columns?: string[] | null
          data_types?: string[] | null
          sample_values?: string[] | null
          synonyms?: string[] | null
          category?: string | null
          confidence?: number | null
          dataset_id: string
          created_at?: string | null
          updated_at?: string | null
          source_file_id?: string | null
          source_filename?: string | null
        }
        Update: {
          id?: number
          term?: string
          definition?: string
          source_columns?: string[] | null
          data_types?: string[] | null
          sample_values?: string[] | null
          synonyms?: string[] | null
          category?: string | null
          confidence?: number | null
          dataset_id?: string
          created_at?: string | null
          updated_at?: string | null
          source_file_id?: string | null
          source_filename?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_glossary_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
