"use client";

import ProductCard from "@/components/home/ProductCard";
import { useWishlistStore } from "@/components/home/useWishlistStore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function FavoritesPage() {
  const { user } = useAuth();
  const items = useWishlistStore((state) => state.items);
  const isSyncing = useWishlistStore((state) => state.isSyncing);
  const error = useWishlistStore((state) => state.error);
  const syncWithUser = useWishlistStore((state) => state.syncWithUser);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    void syncWithUser(user?.id);
  }, [syncWithUser, user?.id]);

  if (isSyncing) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Carregando favoritos...</h1>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-10 text-center shadow-sm">
          <Heart className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h1 className="mb-3 text-3xl font-bold text-foreground">
            Seus favoritos estão vazios
          </h1>
          <p className="mb-8 text-muted-foreground">
            Toque no coração dos produtos para salvar suas peças preferidas e
            voltar nelas quando quiser.
          </p>
          {error && <p className="mb-6 text-sm text-destructive">{error}</p>}
          <Button asChild>
            <Link href="/shop">Explorar produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Minha lista
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Favoritos</h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} {items.length === 1 ? "produto salvo" : "produtos salvos"}
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <Button variant="outline" onClick={() => void clearWishlist(user?.id)}>
          Limpar favoritos
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
