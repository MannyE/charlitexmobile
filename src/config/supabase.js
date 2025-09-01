// Supabase configuration - single instance
import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check:\n' + '- VITE_SUPABASE_URL\n' + '- VITE_SUPABASE_ANON_KEY\n\n' + 'Make sure you have a .env file with these variables.');
}

// Create and export single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Optional: Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
