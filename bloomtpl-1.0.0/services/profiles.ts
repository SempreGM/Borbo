import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tables, Updates } from "@/lib/supabase/types";

export type ProfileRecord = Tables<"profiles">;

export async function listProfiles() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function updateProfile(userId: string, input: Updates<"profiles">) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
