import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listFavorites(userId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, created_at, products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function addFavorite(userId: string, productId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("favorites")
    .upsert({ user_id: userId, product_id: productId });

  if (error) throw error;
}

export async function removeFavorite(userId: string, productId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}
