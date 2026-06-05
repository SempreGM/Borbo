import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getSupabaseServerEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase env vars are missing.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerEnv();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
