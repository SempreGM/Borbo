import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Inserts, Tables, Updates } from "@/lib/supabase/types";

export type ProductRecord = Tables<"products">;
export type ProductVariantRecord = Tables<"product_variants">;
export type CreateProductInput = Inserts<"products">;
export type UpdateProductInput = Updates<"products">;

export type SaveProductVariantInput = {
  size: string;
  color: string;
  stock: number;
  active: boolean;
};

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

export async function listAdminProducts() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
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

export async function listProductVariants(productId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("active", true)
    .order("size", { ascending: true })
    .order("color", { ascending: true });

  if (error) throw error;

  return data;
}

export async function listAdminProductVariants(productId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

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

export async function saveProductVariants(
  productId: string,
  variants: SaveProductVariantInput[]
) {
  const supabase = createSupabaseBrowserClient();

  const { error: deactivateError } = await supabase
    .from("product_variants")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("product_id", productId);

  if (deactivateError) throw deactivateError;

  const normalizedVariants = variants
    .map((variant) => ({
      product_id: productId,
      size: variant.size.trim().toUpperCase(),
      color: variant.color.trim(),
      stock: Math.max(0, Number(variant.stock) || 0),
      active: variant.active,
      updated_at: new Date().toISOString(),
    }))
    .filter((variant) => variant.size && variant.color);

  if (normalizedVariants.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("product_variants")
    .upsert(normalizedVariants, { onConflict: "product_id,size,color" })
    .select();

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
