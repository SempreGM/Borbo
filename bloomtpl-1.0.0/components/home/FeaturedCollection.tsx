"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import {
  fallbackCatalogProducts,
  getFeaturedCatalogProducts,
  type CatalogProduct,
} from "@/lib/catalog";
import {
  listHomeCollections,
  type CollectionWithProducts,
} from "@/services/collections";

interface FeaturedCollectionProps {
  name: string;
  description?: string;
}

type HomeCollection = {
  id: string;
  name: string;
  description?: string;
  highlightLabel: string;
  products: CatalogProduct[];
};

function mapHomeCollection(collection: CollectionWithProducts): HomeCollection {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? undefined,
    highlightLabel: collection.highlight_label || "Destaque da semana",
    products: collection.products,
  };
}

export default function FeaturedCollection({ name, description }: FeaturedCollectionProps) {
  const [collections, setCollections] = useState<HomeCollection[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    async function loadCollections() {
      try {
        const homeCollections = await listHomeCollections(4);

        if (homeCollections.length > 0) {
          setCollections(homeCollections.map(mapHomeCollection));
          return;
        }
      } catch {
        // Keep the storefront usable before the collections table is configured.
      }

      const featuredProducts = await getFeaturedCatalogProducts(3);
      setCollections([
        {
          id: "fallback-featured",
          name,
          description,
          highlightLabel: "Destaque da semana",
          products: featuredProducts.length > 0 ? featuredProducts : fallbackCatalogProducts.slice(0, 3),
        },
      ]);
    }

    loadCollections().finally(() => setIsMounted(true));
  }, [description, name]);

  if (!isMounted) return null;

  return (
    <div id="colecao" className="border-y border-[#ffc4a6]/30 bg-[#ffc4a6]/5">
      {collections.slice(0, 4).map((collection, index) => (
        <section
          key={collection.id}
          className={index === 0 ? "py-12" : "border-t border-[#ffc4a6]/30 py-12"}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-center lg:text-left">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {collection.highlightLabel}
                </p>
                <h2 className="text-3xl font-bold tracking-normal text-[#ec5c8d] sm:text-4xl">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="mt-2 text-lg text-muted-foreground">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collection.products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
