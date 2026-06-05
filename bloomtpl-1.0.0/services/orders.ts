import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Inserts, OrderStatus, PaymentMethod, Tables, Updates } from "@/lib/supabase/types";

export type OrderRecord = Tables<"orders">;
export type OrderItemRecord = Tables<"order_items">;

export type CreateOrderItemInput = {
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
};

export type CreateOrderInput = {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf?: string | null;
  shippingAddress: Inserts<"orders">["shipping_address"];
  paymentMethod: PaymentMethod;
  notes?: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: CreateOrderItemInput[];
};

function createOrderNumber() {
  return `B-${Date.now().toString().slice(-8)}`;
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = createSupabaseBrowserClient();

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

  if (orderError) throw orderError;

  const orderItems: Inserts<"order_items">[] = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId ?? null,
    product_name: item.productName,
    product_image: item.productImage ?? null,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.unitPrice * item.quantity,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (itemsError) throw itemsError;

  return { order, items };
}

export async function listCustomerOrders(userId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function listAdminOrders() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createSupabaseBrowserClient();
  const input: Updates<"orders"> = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("orders")
    .update(input)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
