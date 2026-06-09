"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { CreditCard, Heart, Shield, Tag, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { calculateCouponDiscount, getCouponByCode } from "@/services/coupons";
import {
  calculateShippingCost,
  defaultShippingSettings,
  normalizeShippingSettings,
  SHIPPING_SETTINGS_STORAGE_KEY,
  type ShippingSettings,
} from "@/lib/shippingSettings";
import { getShippingSettings } from "@/services/settings";

export default function OrderSummary() {
  const { cart, appliedCoupon, applyCoupon, clearCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(
    defaultShippingSettings
  );

  useEffect(() => {
    getShippingSettings()
      .then(setShippingSettings)
      .catch(() => {
        const savedSettings = localStorage.getItem(SHIPPING_SETTINGS_STORAGE_KEY);

        if (!savedSettings) {
          return;
        }

        try {
          setShippingSettings(normalizeShippingSettings(JSON.parse(savedSettings)));
        } catch {
          localStorage.removeItem(SHIPPING_SETTINGS_STORAGE_KEY);
        }
      });
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = appliedCoupon
    ? calculateCouponDiscount(appliedCoupon, subtotal)
    : 0;
  const shipping = calculateShippingCost(subtotal, shippingSettings);
  const total = Math.max(0, subtotal - discount) + shipping;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const amountToFreeShipping = Math.max(
    0,
    shippingSettings.freeShippingMinPurchase - subtotal
  );

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim();

    if (!normalizedCode) {
      setCouponError("Informe um cupom.");
      setCouponMessage("");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const coupon = await getCouponByCode(normalizedCode);

      if (!coupon) {
        setCouponError("Cupom não encontrado ou inativo.");
        return;
      }

      if (subtotal < coupon.min_purchase) {
        setCouponError(
          `Este cupom exige compra mínima de ${formatCurrency(coupon.min_purchase)}.`
        );
        return;
      }

      applyCoupon({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase: coupon.min_purchase,
        active: coupon.active,
      });
      setCouponCode("");
      setCouponMessage("Cupom aplicado com sucesso.");
    } catch {
      setCouponError("Não foi possível aplicar o cupom agora.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resumo do pedido</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} itens)
            </span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <Badge variant="secondary" className="text-xs">
                  Grátis
                </Badge>
              ) : (
                formatCurrency(shipping)
              )}
            </span>
          </div>

          {discount > 0 ? (
            <div className="flex justify-between text-sm text-primary">
              <span>Desconto ({appliedCoupon?.code})</span>
              <span className="font-medium">-{formatCurrency(discount)}</span>
            </div>
          ) : null}

          <Separator />

          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            Cupom de desconto
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">
                  {appliedCoupon.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {discount > 0
                    ? `${formatCurrency(discount)} de desconto`
                    : "Cupom aguardando valor mínimo"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={clearCoupon}
                aria-label="Remover cupom"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Digite o cupom"
                className="h-10"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon ? "..." : "Aplicar"}
              </Button>
            </div>
          )}

          {couponError ? (
            <p className="mt-2 text-xs font-medium text-destructive">
              {couponError}
            </p>
          ) : null}
          {couponMessage ? (
            <p className="mt-2 text-xs font-medium text-primary">
              {couponMessage}
            </p>
          ) : null}
        </div>

        {shipping > 0 && shippingSettings.freeShippingEnabled && (
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">
                Frete grátis em pedidos acima de{" "}
                {formatCurrency(shippingSettings.freeShippingMinPurchase)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Adicione {formatCurrency(amountToFreeShipping)} a mais para ganhar!
            </p>
          </div>
        )}

        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          asChild
        >
          <Link href="/checkout" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Finalizar compra
          </Link>
        </Button>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Compra protegida</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-blue-500" />
            <span>Devolução em até 7 dias após o recebimento</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-red-500" />
            <span>Atendimento humanizado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
