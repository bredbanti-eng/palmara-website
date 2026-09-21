import { createClient } from '@supabase/supabase-js';

let client = null;

// Server-only client using the service-role key — never import this from
// a 'use client' component or expose the key to the browser.
export function supabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
    }
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
