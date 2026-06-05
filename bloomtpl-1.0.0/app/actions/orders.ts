"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inserts, OrderStatus } from "@/lib/supabase/types";

type ServerOrderItemInput = {
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
};

export type ServerCreateOrderInput = {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf?: string | null;
  shippingAddress: Inserts<"orders">["shipping_address"];
  paymentMethod: Inserts<"orders">["payment_method"];
  notes?: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: ServerOrderItemInput[];
};

function createOrderNumber() {
  return `B-${Date.now().toString().slice(-8)}`;
}

export async function createOrderAction(input: ServerCreateOrderInput) {
  const supabase = createSupabaseServerClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: createOrderNumber(),
      user_id: input.userId ?? null,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      customer_cpf: input.customerCpf ?? null,
      shipping_address: input.shippingAddress,
      payment_method: input.paymentMethod,
      payment_status: "pending",
      status: "received",
      notes: input.notes ?? null,
      subtotal: input.subtotal,
      shipping_cost: input.shippingCost,
      total: input.total,
    })
    .select()
    .single();

  if (orderError) {
    return { success: false, message: orderError.message };
  }

  const orderItems: Inserts<"order_items">[] = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId ?? null,
    product_name: item.productName,
    product_image: item.productImage ?? null,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return { success: false, message: itemsError.message };
  }

  return { success: true, order };
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, order: data };
}
