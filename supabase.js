import { createClient } from '@supabase/supabase-js';

// La clave "anon" es pública: la seguridad la dan las reglas RLS de schema.sql.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sin-clave'
);
