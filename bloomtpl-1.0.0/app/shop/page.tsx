"use client";

import { useEffect, useMemo, useState } from "react";
import productsData from "@/data/products.json";
import ProductCard from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const allCategories = ["Todos", ...Array.from(new Set(productsData.map((product) => product.category)))];

export default function ShopPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQuery(searchParams.get("q") ?? "");
  }, []);

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return productsData.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div className="bg-background">
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Loja Borbô
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Encontre peças leves, elegantes e versáteis
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Explore vestidos, blusas, alfaiataria e peças essenciais para
                montar combinações modernas com ótimo custo-benefício.
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                type="search"
                placeholder="Buscar por produto ou categoria"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 rounded-full pl-11"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {allCategories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={selectedCategory === category ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Nenhum produto encontrado
              </h2>
              <p className="mt-2 text-muted-foreground">
                Tente buscar por outro termo ou escolha uma categoria diferente.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
