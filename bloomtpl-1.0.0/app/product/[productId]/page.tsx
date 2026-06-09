"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useWishlistStore } from "@/components/home/useWishlistStore";
import Features from "@/components/product/Features";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductNotFound from "@/components/product/ProductNotFound";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getCatalogProducts, type CatalogProduct } from "@/lib/catalog";
import { cn, formatCurrency } from "@/lib/utils";
import {
  listProductVariants,
  type ProductVariantRecord,
} from "@/services/products";

export default function Product() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [variants, setVariants] = useState<ProductVariantRecord[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [variantError, setVariantError] = useState("");

  useEffect(() => {
    getCatalogProducts()
      .then((products) => {
        const currentProduct = products.find(
          (item) => String(item.id) === String(productId)
        );
        setProduct(currentProduct ?? null);

        if (currentProduct && typeof currentProduct.id === "string") {
          void listProductVariants(currentProduct.id)
            .then(setVariants)
            .catch(() => setVariants([]));
        }
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isLiked = useWishlistStore((state) =>
    product ? state.isInWishlist(product.id) : false
  );

  if (isLoading) {
    return null;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const sizes = Array.from(new Set(variants.map((variant) => variant.size)));
  const colors = Array.from(
    new Set(
      variants
        .filter((variant) => !selectedSize || variant.size === selectedSize)
        .map((variant) => variant.color)
    )
  );
  const selectedVariant =
    variants.find(
      (variant) =>
        variant.size === selectedSize &&
        variant.color === selectedColor &&
        variant.active
    ) ?? null;
  const hasVariants = variants.length > 0;
  const maxQuantity = selectedVariant?.stock ?? product.stock ?? 99;

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) {
      setVariantError("Selecione tamanho e cor antes de adicionar ao carrinho.");
      return;
    }

    if (hasVariants && selectedVariant && selectedVariant.stock <= 0) {
      setVariantError("Essa variação está sem estoque.");
      return;
    }

    setIsAdding(true);
    setVariantError("");

    await new Promise((resolve) => setTimeout(resolve, 300));

    for (let index = 0; index < quantity; index++) {
      addToCart({
        id: product.id,
        cartKey: selectedVariant
          ? `${product.id}:${selectedVariant.id}`
          : String(product.id),
        variantId: selectedVariant?.id ?? null,
        size: selectedVariant?.size ?? null,
        color: selectedVariant?.color ?? null,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    setIsAdding(false);
    setJustAdded(true);

    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push("/cart"), 500);
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((current) => Math.min(maxQuantity, current + 1));
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumb />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="w-full max-w-[500px] mx-auto flex flex-col items-center px-4">
            <div className="rounded-xl shadow-lg overflow-hidden mb-4 w-full">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                priority
                fetchPriority="high"
                className="rounded-xl object-cover w-full h-auto max-h-[500px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              (4.8) • 127 avaliações
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <Separator />

          <div className="space-y-4">
            {hasVariants ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tamanho
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => {
                          setSelectedSize(size);
                          setSelectedColor("");
                          setQuantity(1);
                          setVariantError("");
                        }}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Cor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const variant = variants.find(
                        (item) => item.size === selectedSize && item.color === color
                      );
                      const isDisabled = !selectedSize || !variant || variant.stock <= 0;

                      return (
                        <Button
                          key={color}
                          type="button"
                          variant={selectedColor === color ? "default" : "outline"}
                          onClick={() => {
                            setSelectedColor(color);
                            setQuantity(1);
                            setVariantError("");
                          }}
                          disabled={isDisabled}
                        >
                          {color}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {selectedVariant ? (
                  <p className="text-sm text-muted-foreground">
                    Estoque disponível: {selectedVariant.stock}
                  </p>
                ) : null}
                {variantError ? (
                  <p className="text-sm font-medium text-destructive">
                    {variantError}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={quantity >= maxQuantity}
                    className="h-10 w-10 rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className={cn(
                  "flex-1 transition-all duration-300",
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

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                className="flex-1"
              >
                Comprar agora
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void toggleWishlist(product, user?.id)}
                className={cn(
                  "justify-start text-muted-foreground hover:text-foreground",
                  isLiked && "text-destructive"
                )}
              >
                <Heart
                  className={cn("h-4 w-4 mr-2", isLiked && "fill-current")}
                />
                {isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Features />

      <RelatedProducts product={product} />
    </div>
  );
}
