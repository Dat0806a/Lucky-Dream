import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your environment variables.');
}

// Ensure we don't crash if URL is empty by providing a fallback string that won't throw immediately
// but will fail on actual requests, allowing the app to render the loading/error state.
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && !!supabaseAnonKey && supabaseAnonKey !== 'placeholder';
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
