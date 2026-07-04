import { createClient } from '@supabase/supabase-js';

// Direct access to environment variables in Vite
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Robust URL handling
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

const isConfigured = !!supabaseUrl && 
                     supabaseUrl !== 'https://placeholder.supabase.co' && 
                     supabaseUrl.includes('.supabase.co') &&
                     !!supabaseAnonKey && 
                     supabaseAnonKey !== 'placeholder';

if (!isConfigured) {
  console.warn('Supabase credentials missing or invalid. App will use mock data for social features.');
} else {
  console.log('Supabase initialized successfully');
}

export const isSupabaseConfigured = () => isConfigured;

// Simple connection check that doesn't hang
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isConfigured) return false;
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1).abortSignal(AbortSignal.timeout(3000));
    if (error) {
      // PGRST111 is "no rows", PGRST116 is "multiple rows", both mean it connected
      return ['PGRST111', 'PGRST116'].includes(error.code) || !error;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder',
  {
    global: {
      fetch: (...args) => {
        const [url, options] = args;
        return fetch(url, { ...options, cache: 'no-store' });
      }
    }
  }
);
