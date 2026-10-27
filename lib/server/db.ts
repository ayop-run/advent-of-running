import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

/**
 * Supabase client with the secret key: bypasses row-level security. Server code only
 * (route handlers); never import this from a client component.
 */
export function db() {
  if (typeof window !== 'undefined') throw new Error('lib/server/db is server-only');
  admin ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
