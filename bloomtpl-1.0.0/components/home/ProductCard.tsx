"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn, formatCurrency } from "@/lib/utils";
import { useWishlistStore } from "./useWishlistStore";
import { Check, Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string | number;
  image: string;
  name: string;
  price: number;
  category?: string;
}

export default function ProductCard({
  product,
  isAdmin = false,
}: {
  product: Product;
  isAdmin?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart } = useCart();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isLiked = useWishlistStore((state) => state.isInWishlist(product.id));

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    setIsAdding(false);
    setJustAdded(true);

    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleLike = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {!isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            name="Like Button"
            className={cn(
              "absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background",
              isLiked && "opacity-100 text-destructive"
            )}
            onClick={handleToggleLike}
          >
            <Heart
              name="Like Icon"
              className={cn("h-4 w-4", isLiked && "fill-current")}
            />
          </Button>
        )}

        {product.category && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primary shadow-sm">
            {product.category}
          </span>
        )}

        <Link href={`/product/${product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-muted">
            {!imageError ? (
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Imagem indisponível
                </div>
              </div>
            )}
          </div>

          {!isAdmin && (
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            </div>
          )}
        </Link>
      </div>

      <CardContent className="p-4 space-y-3">
        <Link href={`/product/${product.id}`}>
          <h2 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(product.price)}
          </span>
        </div>

        {!isAdmin && (
          <Button
            className={cn(
              "w-full transition-all duration-300",
              justAdded
                ? "bg-green-600 text-white hover:bg-green-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Adicionando...
              </div>
            ) : justAdded ? (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Adicionado ao carrinho!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Adicionar ao carrinho
              </div>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
