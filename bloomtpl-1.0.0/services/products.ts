import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Inserts, Tables, Updates } from "@/lib/supabase/types";

export type ProductRecord = Tables<"products">;
export type CreateProductInput = Inserts<"products">;
export type UpdateProductInput = Updates<"products">;

export async function listProducts() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function listFeaturedProducts() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProductById(productId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) throw error;

  return data;
}

export async function createProduct(input: CreateProductInput) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProduct(productId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);

  if (error) throw error;
}
