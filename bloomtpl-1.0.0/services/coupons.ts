import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CouponDiscountType, Inserts, Tables, Updates } from "@/lib/supabase/types";

export type CouponRecord = Tables<"coupons">;

export type SaveCouponInput = {
  code: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minPurchase: number;
  active: boolean;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

type DiscountableCoupon = Pick<
  CouponRecord,
  "active" | "discount_type" | "discount_value" | "min_purchase"
>;

export function calculateCouponDiscount(coupon: DiscountableCoupon, subtotal: number) {
  if (!coupon.active || subtotal < coupon.min_purchase) {
    return 0;
  }

  if (coupon.discount_type === "percentage") {
    return Math.min(subtotal, subtotal * (coupon.discount_value / 100));
  }

  return Math.min(subtotal, coupon.discount_value);
}

export async function listCoupons() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getCouponByCode(code: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalizeCode(code))
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function createCoupon(input: SaveCouponInput) {
  const supabase = createSupabaseBrowserClient();
  const payload: Inserts<"coupons"> = {
    code: normalizeCode(input.code),
    description: input.description ?? null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_purchase: input.minPurchase,
    active: input.active,
  };

  const { data, error } = await supabase.from("coupons").insert(payload).select().single();

  if (error) throw error;

  return data;
}

export async function updateCoupon(couponId: string, input: SaveCouponInput) {
  const supabase = createSupabaseBrowserClient();
  const payload: Updates<"coupons"> = {
    code: normalizeCode(input.code),
    description: input.description ?? null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_purchase: input.minPurchase,
    active: input.active,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("coupons")
    .update(payload)
    .eq("id", couponId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteCoupon(couponId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("coupons")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", couponId);

  if (error) throw error;
}
