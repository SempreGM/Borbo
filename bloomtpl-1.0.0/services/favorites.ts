import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProductRecord } from "./products";

export type FavoriteProduct = {
  id: string;
  image: string;
  name: string;
  price: number;
  category?: string;
};

type FavoriteRow = {
  product_id: string;
  created_at: string;
  products: ProductRecord | null;
};

function mapFavoriteProduct(product: ProductRecord): FavoriteProduct {
  return {
    id: product.id,
    image: product.images[0] ?? "/images/NoImage.jpg",
    name: product.name,
    price: product.price,
    category: product.category_name ?? undefined,
  };
}

export async function listFavorites(userId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, created_at, products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as FavoriteRow[])
    .map((favorite) => favorite.products)
    .filter((product): product is ProductRecord => Boolean(product))
    .map(mapFavoriteProduct);
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

export async function clearFavorites(userId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("favorites").delete().eq("user_id", userId);

  if (error) throw error;
}
