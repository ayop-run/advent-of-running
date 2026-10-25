import { createBrowserClient } from '@supabase/ssr';

/** Browser client with the publishable key. Only lib/data.ts should import this. */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
