import { createClient } from '@supabase/supabase-js';

// Default Supabase project URL yang sudah disiapkan untuk proyek Libraria
export const DEFAULT_SUPABASE_URL = 'https://zdbfxiughuxfttozfyxr.supabase.co';

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!key && typeof window !== 'undefined') {
    key = localStorage.getItem('libraria_supabase_anon_key') || '';
  }

  return {
    url,
    key,
    isConfigured: Boolean(url && key && key !== 'YOUR_SUPABASE_ANON_KEY'),
  };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.isConfigured;

// Inisialisasi Supabase client
export const supabase = createClient(
  config.url,
  config.key || 'dummy-key-for-initialization',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
