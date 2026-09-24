import { createClient } from '@supabase/supabase-js';

// Default Supabase project URL yang sudah disiapkan untuk proyek Libraria
const DEFAULT_SUPABASE_URL = 'https://zdbfxiughuxfttozfyxr.supabase.co';

// Mendapatkan URL & Anon Key dari environment variable Vite atau fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

// Inisialisasi Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'dummy-key-for-initialization',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
