import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// El frontend usa la anon key (segura para exponer en el navegador);
// el backend usa la service_role key para operaciones privilegiadas.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
