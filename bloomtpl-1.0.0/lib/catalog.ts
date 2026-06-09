import productsData from "@/data/products.json";
import { listFeaturedProducts, listProducts, type ProductRecord } from "@/services/products";

export type CatalogProduct = {
  id: string | number;
  image: string;
  name: string;
  price: number;
  stock?: number;
  category?: string;
  description: string;
};

export const fallbackCatalogProducts: CatalogProduct[] = productsData.map((product) => ({
  id: product.id,
  image: product.image,
  name: product.name,
  price: product.price,
  category: product.category,
  description: product.description,
}));

export function mapProductRecord(product: ProductRecord): CatalogProduct {
  return {
    id: product.id,
    image: product.images[0] ?? "/images/NoImage.jpg",
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category_name ?? undefined,
    description: product.description,
  };
}

export async function getCatalogProducts(limit?: number) {
  try {
    const products = await listProducts();
    if (products.length > 0) {
      const mappedProducts = products.map(mapProductRecord);
      return typeof limit === "number" ? mappedProducts.slice(0, limit) : mappedProducts;
    }
  } catch {
    // Keep the storefront usable before Supabase is configured.
  }

  return typeof limit === "number"
    ? fallbackCatalogProducts.slice(0, limit)
    : fallbackCatalogProducts;
}

export async function getFeaturedCatalogProducts(limit = 3) {
  try {
    const products = await listFeaturedProducts();
    if (products.length > 0) {
      return products.map(mapProductRecord).slice(0, limit);
    }
  } catch {
    // Keep the storefront usable before Supabase is configured.
  }

  return fallbackCatalogProducts.slice(0, limit);
}
