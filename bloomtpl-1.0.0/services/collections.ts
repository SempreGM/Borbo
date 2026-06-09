import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Inserts, Tables, Updates } from "@/lib/supabase/types";
import type { ProductRecord } from "./products";

export type CollectionRecord = Tables<"collections">;
export type CollectionProductRecord = Tables<"collection_products">;

export type CollectionProductItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category?: string;
};

export type CollectionWithProducts = CollectionRecord & {
  products: CollectionProductItem[];
};

export type SaveCollectionInput = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  highlightLabel: string;
  isFeatured: boolean;
  productIds: string[];
};

type CollectionProductJoin = {
  order_index: number;
  products: ProductRecord | null;
};

type CollectionJoin = CollectionRecord & {
  collection_products?: CollectionProductJoin[];
};

function mapProduct(product: ProductRecord): CollectionProductItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? "/images/NoImage.jpg",
    description: product.description,
    category: product.category_name ?? undefined,
  };
}

function mapCollection(collection: CollectionJoin): CollectionWithProducts {
  const products = (collection.collection_products ?? [])
    .slice()
    .sort((first, second) => first.order_index - second.order_index)
    .map((item) => item.products)
    .filter((product): product is ProductRecord => Boolean(product))
    .map(mapProduct);

  return {
    ...collection,
    products,
  };
}

async function replaceCollectionProducts(collectionId: string, productIds: string[]) {
  const supabase = createSupabaseBrowserClient();

  const { error: deleteError } = await supabase
    .from("collection_products")
    .delete()
    .eq("collection_id", collectionId);

  if (deleteError) throw deleteError;

  if (productIds.length === 0) {
    return;
  }

  const rows: Inserts<"collection_products">[] = productIds.map((productId, index) => ({
    collection_id: collectionId,
    product_id: productId,
    order_index: index,
  }));

  const { error: insertError } = await supabase.from("collection_products").insert(rows);

  if (insertError) throw insertError;
}

export async function listCollections() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_products(order_index, products(*))")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as CollectionJoin[]).map(mapCollection);
}

export async function getFeaturedCollection() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_products(order_index, products(*))")
    .eq("active", true)
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data ? mapCollection(data as unknown as CollectionJoin) : null;
}

export async function listHomeCollections(limit = 4) {
  const supabase = createSupabaseBrowserClient();
  const safeLimit = Math.min(Math.max(limit, 1), 4);

  const { data: featuredData, error: featuredError } = await supabase
    .from("collections")
    .select("*, collection_products(order_index, products(*))")
    .eq("active", true)
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(safeLimit);

  if (featuredError) throw featuredError;

  const featuredCollections = ((featuredData ?? []) as unknown as CollectionJoin[])
    .map(mapCollection)
    .filter((collection) => collection.products.length > 0);

  if (featuredCollections.length > 0) {
    return featuredCollections;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("collections")
    .select("*, collection_products(order_index, products(*))")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (fallbackError) throw fallbackError;

  return ((fallbackData ?? []) as unknown as CollectionJoin[])
    .map(mapCollection)
    .filter((collection) => collection.products.length > 0);
}

export async function createCollection(input: SaveCollectionInput) {
  const supabase = createSupabaseBrowserClient();

  const payload: Inserts<"collections"> = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    highlight_label: input.highlightLabel,
    is_featured: input.isFeatured,
    active: true,
  };

  const { data, error } = await supabase
    .from("collections")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  await replaceCollectionProducts(data.id, input.productIds);

  return (await listCollections()).find((collection) => collection.id === data.id) ?? {
    ...data,
    products: [],
  };
}

export async function updateCollection(collectionId: string, input: SaveCollectionInput) {
  const supabase = createSupabaseBrowserClient();

  const payload: Updates<"collections"> = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    highlight_label: input.highlightLabel,
    is_featured: input.isFeatured,
    active: true,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("collections").update(payload).eq("id", collectionId);

  if (error) throw error;

  await replaceCollectionProducts(collectionId, input.productIds);

  return (await listCollections()).find((collection) => collection.id === collectionId);
}

export async function deleteCollection(collectionId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("collections")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", collectionId);

  if (error) throw error;
}
