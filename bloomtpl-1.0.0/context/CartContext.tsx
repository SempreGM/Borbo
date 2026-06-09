"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CouponDiscountType } from "@/lib/supabase/types";

export type AppliedCoupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_purchase: number;
  active: boolean;
};

interface CartItem {
  id: string | number;
  cartKey?: string;
  variantId?: string | null;
  size?: string | null;
  color?: string | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextProps {
  cart: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (name: string | number) => void;
  clearCart: () => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  clearCoupon: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      setAppliedCoupon(JSON.parse(savedCoupon));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [appliedCoupon]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const itemKey = item.cartKey ?? String(item.id);
      const existingItem = prevCart.find(
        (cartItem) => (cartItem.cartKey ?? String(cartItem.id)) === itemKey
      );

      if (existingItem) {
        return prevCart.map((cartItem) =>
          (cartItem.cartKey ?? String(cartItem.id)) === itemKey
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, cartKey: itemKey, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => (item.cartKey ?? item.id) !== id)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem("cart");
    localStorage.removeItem("appliedCoupon");
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.cartKey ?? item.id) === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        appliedCoupon,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        applyCoupon,
        clearCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
