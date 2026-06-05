"use client";

import ProductCard from "@/components/home/ProductCard";
import { useWishlistStore } from "@/components/home/useWishlistStore";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const items = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <Heart className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Seus favoritos estão vazios
          </h1>
          <p className="text-muted-foreground mb-8">
            Toque no coração dos produtos para salvar suas peças preferidas e
            voltar nelas quando quiser.
          </p>
          <Button asChild>
            <Link href="/shop">Explorar produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Minha lista
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Favoritos
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} {items.length === 1 ? "produto salvo" : "produtos salvos"}
          </p>
        </div>
        <Button variant="outline" onClick={clearWishlist}>
          Limpar favoritos
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
