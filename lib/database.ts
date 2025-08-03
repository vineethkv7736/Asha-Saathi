import { supabase } from './supabase';
import type { Database } from './supabase';

type Mother = Database['public']['Tables']['mothers']['Row'];
type Child = Database['public']['Tables']['children']['Row'];
type Visit = Database['public']['Tables']['visits']['Row'];

// Screening interface
export interface Screening {
  id: string;
  person_id: string;
  person_type: 'mother' | 'child';
  image_url?: string;
  analysis_results: any;
  analysis_type: 'skin' | 'posture' | 'general' | 'combined';
  condition?: string;
  notes?: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Mother operations
export const motherService = {
  async getAll(): Promise<Mother[]> {
    console.log('🔍 [DB] Fetching all mothers');
    const { data, error } = await supabase
      .from('mothers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ [DB] Error fetching mothers:', error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} mothers`);
    return data || [];
  },

  async getById(id: string): Promise<Mother | null> {
    console.log(`🔍 [DB] Fetching mother by ID: ${id}`);
    const { data, error } = await supabase
      .from('mothers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error fetching mother: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Mother found: ${data.name}`);
    return data;
  },

  async create(motherData: Omit<Mother, 'id' | 'created_at' | 'updated_at'>): Promise<Mother | null> {
    console.log(`📝 [DB] Creating mother: ${motherData.name}`);
    const { data, error } = await supabase
      .from('mothers')
      .insert(motherData)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error creating mother: ${motherData.name}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Mother created: ${data.name} (ID: ${data.id})`);
    return data;
  },

  async update(id: string, updates: Partial<Mother>): Promise<Mother | null> {
    console.log(`📝 [DB] Updating mother: ${id}`);
    const { data, error } = await supabase
      .from('mothers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error updating mother: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Mother updated: ${data.name}`);
    return data;
  },

  async delete(id: string): Promise<boolean> {
    console.log(`🗑️ [DB] Deleting mother: ${id}`);
    const { error } = await supabase
      .from('mothers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.log(`❌ [DB] Error deleting mother: ${id}`, error.message);
      return false;
    }
    console.log(`✅ [DB] Mother deleted: ${id}`);
    return true;
  },

  async getByRiskLevel(riskLevel: 'high' | 'medium' | 'low'): Promise<Mother[]> {
    console.log(`🔍 [DB] Fetching mothers by risk level: ${riskLevel}`);
    const { data, error } = await supabase
      .from('mothers')
      .select('*')
      .eq('risk_level', riskLevel)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log(`❌ [DB] Error fetching mothers by risk level: ${riskLevel}`, error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} mothers with risk level: ${riskLevel}`);
    return data || [];
  },
};

// Child operations
export const childService = {
  async getAll(): Promise<Child[]> {
    console.log('🔍 [DB] Fetching all children');
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ [DB] Error fetching children:', error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} children`);
    return data || [];
  },

  async getById(id: string): Promise<Child | null> {
    console.log(`🔍 [DB] Fetching child by ID: ${id}`);
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error fetching child: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Child found: ${data.name}`);
    return data;
  },

  async getByMotherId(motherId: string): Promise<Child[]> {
    console.log(`🔍 [DB] Fetching children by mother ID: ${motherId}`);
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('mother_id', motherId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log(`❌ [DB] Error fetching children by mother: ${motherId}`, error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} children for mother: ${motherId}`);
    return data || [];
  },

  async create(childData: Omit<Child, 'id' | 'created_at' | 'updated_at'>): Promise<Child | null> {
    console.log(`📝 [DB] Creating child: ${childData.name}`);
    const { data, error } = await supabase
      .from('children')
      .insert(childData)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error creating child: ${childData.name}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Child created: ${data.name} (ID: ${data.id})`);
    return data;
  },

  async update(id: string, updates: Partial<Child>): Promise<Child | null> {
    console.log(`📝 [DB] Updating child: ${id}`);
    const { data, error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error updating child: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Child updated: ${data.name}`);
    return data;
  },

  async delete(id: string): Promise<boolean> {
    console.log(`🗑️ [DB] Deleting child: ${id}`);
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.log(`❌ [DB] Error deleting child: ${id}`, error.message);
      return false;
    }
    console.log(`✅ [DB] Child deleted: ${id}`);
    return true;
  },

  async getByAgeRange(minMonths: number, maxMonths: number): Promise<Child[]> {
    console.log(`🔍 [DB] Fetching children by age range: ${minMonths}-${maxMonths} months`);
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .gte('age_in_months', minMonths)
      .lte('age_in_months', maxMonths)
      .order('age_in_months', { ascending: true });
    
    if (error) {
      console.log(`❌ [DB] Error fetching children by age range: ${minMonths}-${maxMonths}`, error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} children in age range: ${minMonths}-${maxMonths} months`);
    return data || [];
  },
};

// Visit operations
export const visitService = {
  async getAll(): Promise<Visit[]> {
    console.log('🔍 [DB] Fetching all visits');
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.log('❌ [DB] Error fetching visits:', error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} visits`);
    return data || [];
  },

  async getToday(): Promise<Visit[]> {
    console.log('🔍 [DB] Fetching today\'s visits');
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('visit_date', today)
      .order('visit_date', { ascending: true });
    
    if (error) {
      console.log('❌ [DB] Error fetching today\'s visits:', error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} visits for today`);
    return data || [];
  },

  async create(visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at'>): Promise<Visit | null> {
    console.log(`📝 [DB] Creating visit for mother: ${visitData.mother_id}`);
    const { data, error } = await supabase
      .from('visits')
      .insert(visitData)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error creating visit: ${visitData.mother_id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Visit created: ${data.id} for mother: ${data.mother_id}`);
    return data;
  },

  async update(id: string, updates: Partial<Visit>): Promise<Visit | null> {
    console.log(`📝 [DB] Updating visit: ${id}`);
    const { data, error } = await supabase
      .from('visits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error updating visit: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Visit updated: ${data.id}`);
    return data;
  },

  async delete(id: string): Promise<boolean> {
    console.log(`🗑️ [DB] Deleting visit: ${id}`);
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.log(`❌ [DB] Error deleting visit: ${id}`, error.message);
      return false;
    }
    console.log(`✅ [DB] Visit deleted: ${id}`);
    return true;
  },

  async getByMotherId(motherId: string): Promise<Visit[]> {
    console.log(`🔍 [DB] Fetching visits for mother: ${motherId}`);
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('mother_id', motherId)
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.log(`❌ [DB] Error fetching visits for mother: ${motherId}`, error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} visits for mother: ${motherId}`);
    return data || [];
  },
};

// Screening operations
export const screeningService = {
  async getAll(): Promise<Screening[]> {
    console.log('🔍 [DB] Fetching all screenings');
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ [DB] Error fetching screenings:', error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} screenings`);
    return data || [];
  },

  async getByPersonId(personId: string, personType: 'mother' | 'child'): Promise<Screening[]> {
    console.log(`🔍 [DB] Fetching screenings for ${personType}: ${personId}`);
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('person_id', personId)
      .eq('person_type', personType)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log(`❌ [DB] Error fetching screenings for ${personType}: ${personId}`, error.message);
      return [];
    }
    console.log(`✅ [DB] Fetched ${data?.length || 0} screenings for ${personType}: ${personId}`);
    return data || [];
  },

  async getById(id: string): Promise<Screening | null> {
    console.log(`🔍 [DB] Fetching screening by ID: ${id}`);
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error fetching screening: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Screening found: ${data.id}`);
    return data;
  },

  async create(screeningData: Omit<Screening, 'id' | 'created_at' | 'updated_at'>): Promise<Screening | null> {
    console.log(`📝 [DB] Creating screening for ${screeningData.person_type}: ${screeningData.person_id}`);
    const { data, error } = await supabase
      .from('screenings')
      .insert(screeningData)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error creating screening: ${screeningData.person_id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Screening created: ${data.id} for ${data.person_type}: ${data.person_id}`);
    return data;
  },

  async update(id: string, updates: Partial<Screening>): Promise<Screening | null> {
    console.log(`📝 [DB] Updating screening: ${id}`);
    const { data, error } = await supabase
      .from('screenings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ [DB] Error updating screening: ${id}`, error.message);
      return null;
    }
    console.log(`✅ [DB] Screening updated: ${data.id}`);
    return data;
  },

  async delete(id: string): Promise<boolean> {
    console.log(`🗑️ [DB] Deleting screening: ${id}`);
    const { error } = await supabase
      .from('screenings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.log(`❌ [DB] Error deleting screening: ${id}`, error.message);
      return false;
    }
    console.log(`✅ [DB] Screening deleted: ${id}`);
    return true;
  },
};

// Dashboard operations
export const dashboardService = {
  async getStats() {
    console.log('📊 [DB] Fetching dashboard stats');
    
    try {
      // Get counts
      const [mothersResult, childrenResult, visitsResult, todayVisitsResult] = await Promise.all([
        supabase.from('mothers').select('*', { count: 'exact', head: true }),
        supabase.from('children').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }).eq('visit_date', new Date().toISOString().split('T')[0])
      ]);

      // Get high-risk mothers
      const { data: highRiskMothers } = await supabase
        .from('mothers')
        .select('*')
        .eq('risk_level', 'high');

      // Get children needing attention
      const { data: childrenNeedingAttention } = await supabase
        .from('children')
        .select('*')
        .eq('health_status', 'needs_attention');

      const stats = {
        totalMothers: mothersResult.count || 0,
        totalChildren: childrenResult.count || 0,
        totalVisits: visitsResult.count || 0,
        todayVisits: todayVisitsResult.count || 0,
        highRiskMothers: highRiskMothers?.length || 0,
        childrenNeedingAttention: childrenNeedingAttention?.length || 0,
      };

      console.log('✅ [DB] Dashboard stats fetched:', stats);
      return stats;
    } catch (error) {
      console.log('❌ [DB] Error fetching dashboard stats:', error);
      return {
        totalMothers: 0,
        totalChildren: 0,
        totalVisits: 0,
        todayVisits: 0,
        highRiskMothers: 0,
        childrenNeedingAttention: 0,
      };
    }
  },
}; 