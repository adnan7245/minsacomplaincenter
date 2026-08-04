import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://levhyxihbmlawuxgxyzy.supabase.co';
const defaultKey = 'sb_publishable_ixyQITQA-bsKuP8s6sM_Zg_IMCSMQlx';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || defaultKey;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = (supabaseUrl && !supabaseUrl.includes('your-project-id')) ? supabaseUrl : defaultUrl;
  const key = (supabaseAnonKey && !supabaseAnonKey.includes('your-supabase-publishable-key')) ? supabaseAnonKey : defaultKey;

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return true;
}

