import { createClient } from '@supabase/supabase-js';

// Default Supabase project URL yang sudah disiapkan untuk proyek Libraria
export const DEFAULT_SUPABASE_URL = 'https://zdbfxiughuxfttozfyxr.supabase.co';
export const PRODUCTION_SITE_URL = 'https://libraria-xi.vercel.app';

export const getAuthRedirectUrl = (): string => {
  if (typeof window !== 'undefined') {
    const savedRedirect = localStorage.getItem('libraria_auth_redirect_url');
    if (savedRedirect) return savedRedirect;
    if (window.location.hostname.includes('vercel.app')) {
      return window.location.origin;
    }
  }
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || PRODUCTION_SITE_URL;
};

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
