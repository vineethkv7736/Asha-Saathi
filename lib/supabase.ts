import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types
export interface Database {
  public: {
    Tables: {
      mothers: {
        Row: {
          id: string;
          name: string;
          age: number;
          mobile: string;
          address: string;
          risk_level: 'high' | 'medium' | 'low';
          pregnancy_week?: number;
          last_visit: string;
          children_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age: number;
          mobile: string;
          address: string;
          risk_level: 'high' | 'medium' | 'low';
          pregnancy_week?: number;
          last_visit: string;
          children_count: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number;
          mobile?: string;
          address?: string;
          risk_level?: 'high' | 'medium' | 'low';
          pregnancy_week?: number;
          last_visit?: string;
          children_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          name: string;
          age_in_months: number;
          mother_id: string;
          health_status: 'healthy' | 'needs_attention' | 'critical';
          last_screening: string;
          vaccinations_completed: number;
          vaccinations_total: number;
          has_photo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age_in_months: number;
          mother_id: string;
          health_status: 'healthy' | 'needs_attention' | 'critical';
          last_screening: string;
          vaccinations_completed: number;
          vaccinations_total: number;
          has_photo: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age_in_months?: number;
          mother_id?: string;
          health_status?: 'healthy' | 'needs_attention' | 'critical';
          last_screening?: string;
          vaccinations_completed?: number;
          vaccinations_total?: number;
          has_photo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      visits: {
        Row: {
          id: string;
          mother_id: string;
          visit_date: string;
          visit_type: 'prenatal' | 'postnatal' | 'screening' | 'vaccination';
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mother_id: string;
          visit_date: string;
          visit_type: 'prenatal' | 'postnatal' | 'screening' | 'vaccination';
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mother_id?: string;
          visit_date?: string;
          visit_type?: 'prenatal' | 'postnatal' | 'screening' | 'vaccination';
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      screenings: {
        Row: {
          id: string;
          person_id: string;
          person_type: 'mother' | 'child';
          image_url: string | null;
          analysis_results: any;
          analysis_type: 'skin' | 'posture' | 'general' | 'combined';
          condition: string | null;
          notes: string | null;
          risk_level: 'low' | 'medium' | 'high';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          person_type: 'mother' | 'child';
          image_url?: string | null;
          analysis_results: any;
          analysis_type: 'skin' | 'posture' | 'general' | 'combined';
          condition?: string | null;
          notes?: string | null;
          risk_level: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          person_type?: 'mother' | 'child';
          image_url?: string | null;
          analysis_results?: any;
          analysis_type?: 'skin' | 'posture' | 'general' | 'combined';
          condition?: string | null;
          notes?: string | null;
          risk_level?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
      };
      examinations: {
        Row: {
          id: string;
          person_id: string;
          person_type: 'mother' | 'child';
          answers: any;
          bmi: number | null;
          bmi_category: 'underweight' | 'normal' | 'overweight' | 'obese' | null;
          health_status: 'healthy' | 'needs_attention' | 'critical';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          person_type: 'mother' | 'child';
          answers: any;
          bmi?: number | null;
          bmi_category?: 'underweight' | 'normal' | 'overweight' | 'obese' | null;
          health_status: 'healthy' | 'needs_attention' | 'critical';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          person_type?: 'mother' | 'child';
          answers?: any;
          bmi?: number | null;
          bmi_category?: 'underweight' | 'normal' | 'overweight' | 'obese' | null;
          health_status?: 'healthy' | 'needs_attention' | 'critical';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vaccinations: {
        Row: {
          id: string;
          child_id: string;
          bcg: boolean;
          opv_0: boolean;
          hepatitis_b: boolean;
          pentavalent_1: boolean;
          rotavirus_1: boolean;
          measles_rubella_1: boolean;
          total_vaccines: number;
          completed_vaccines: number;
          progress_percentage: number;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          bcg?: boolean;
          opv_0?: boolean;
          hepatitis_b?: boolean;
          pentavalent_1?: boolean;
          rotavirus_1?: boolean;
          measles_rubella_1?: boolean;
          total_vaccines?: number;
          completed_vaccines?: number;
          progress_percentage?: number;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          bcg?: boolean;
          opv_0?: boolean;
          hepatitis_b?: boolean;
          pentavalent_1?: boolean;
          rotavirus_1?: boolean;
          measles_rubella_1?: boolean;
          total_vaccines?: number;
          completed_vaccines?: number;
          progress_percentage?: number;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 