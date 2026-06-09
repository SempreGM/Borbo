"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface CartItemProps {
  item: {
    id: string | number;
    cartKey?: string;
    variantId?: string | null;
    size?: string | null;
    color?: string | null;
    name: string;
    price: number;
    image: string;
    quantity: number;
  };
  isLast: boolean;
}

export default function CartItem({ item, isLast }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();
  const itemKey = item.cartKey ?? item.id;

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="relative w-[100px] h-[100px]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="100px"
            className="rounded-lg object-cover bg-muted"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="font-semibold text-foreground line-clamp-2">
                {item.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(item.price)} cada
              </p>
              {(item.size || item.color) ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {[item.size ? `Tam. ${item.size}` : null, item.color].filter(Boolean).join(" • ")}
                </p>
              ) : null}
            </div>

            <Button
              variant="ghost"
              onClick={() => removeFromCart(itemKey)}
              className="h-8 shrink-0 gap-2 px-2 text-muted-foreground hover:text-destructive"
              aria-label={`Remover ${item.name} do carrinho`}
              title="Remover item"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden text-xs font-medium sm:inline">Remover</span>
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  updateQuantity(itemKey, Math.max(1, item.quantity - 1))
                }
                disabled={item.quantity <= 1}
                className="h-8 w-8 rounded-r-none"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-4 py-2 min-w-[50px] text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                className="h-8 w-8 rounded-l-none"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isLast && <Separator className="mt-4" />}
    </div>
  );
}
