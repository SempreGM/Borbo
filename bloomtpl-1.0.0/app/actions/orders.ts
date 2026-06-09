"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Inserts, OrderStatus } from "@/lib/supabase/types";

type ServerOrderItemInput = {
  productId?: string | null;
  variantId?: string | null;
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

function normalizeProductId(productId?: string | null) {
  return productId && productId.length >= 30 ? productId : null;
}

function getTrackedQuantities(items: ServerOrderItemInput[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    if (item.variantId) {
      return acc;
    }

    const productId = normalizeProductId(item.productId);

    if (!productId) {
      return acc;
    }

    acc[productId] = (acc[productId] ?? 0) + item.quantity;
    return acc;
  }, {});
}

function getTrackedVariantQuantities(items: ServerOrderItemInput[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    if (!item.variantId) {
      return acc;
    }

    acc[item.variantId] = (acc[item.variantId] ?? 0) + item.quantity;
    return acc;
  }, {});
}

async function validateTrackedVariantStock(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  quantitiesByVariantId: Record<string, number>
) {
  const variantIds = Object.keys(quantitiesByVariantId);

  if (variantIds.length === 0) {
    return { success: true as const, variants: [] };
  }

  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id, size, color, stock, active, products(name)")
    .in("id", variantIds);

  if (error) {
    return {
      success: false as const,
      message: "Nao foi possivel verificar o estoque das variacoes agora.",
    };
  }

  for (const variantId of variantIds) {
    const variant = variants?.find((item) => item.id === variantId);
    const requestedQuantity = quantitiesByVariantId[variantId];

    if (!variant || !variant.active) {
      return {
        success: false as const,
        message: "Uma das variacoes do carrinho nao esta mais disponivel.",
      };
    }

    if (variant.stock < requestedQuantity) {
      const productName = Array.isArray(variant.products)
        ? variant.products[0]?.name
        : variant.products?.name;
      return {
        success: false as const,
        message: `Estoque insuficiente para ${productName ?? "produto"} (${variant.size} - ${variant.color}). Disponivel: ${variant.stock}.`,
      };
    }
  }

  return { success: true as const, variants: variants ?? [] };
}

async function validateTrackedStock(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  quantitiesByProductId: Record<string, number>
) {
  const productIds = Object.keys(quantitiesByProductId);

  if (productIds.length === 0) {
    return { success: true as const };
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, stock")
    .in("id", productIds);

  if (error) {
    return {
      success: false as const,
      message: "Nao foi possivel verificar o estoque agora.",
    };
  }

  for (const productId of productIds) {
    const product = products?.find((item) => item.id === productId);
    const requestedQuantity = quantitiesByProductId[productId];

    if (!product) {
      return {
        success: false as const,
        message: "Um dos produtos do carrinho nao esta mais disponivel.",
      };
    }

    if (product.stock < requestedQuantity) {
      return {
        success: false as const,
        message: `Estoque insuficiente para ${product.name}. Disponivel: ${product.stock}.`,
      };
    }
  }

  return { success: true as const, products: products ?? [] };
}

async function decrementTrackedStock(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  products: { id: string; stock: number }[],
  quantitiesByProductId: Record<string, number>
) {
  for (const product of products) {
    const quantity = quantitiesByProductId[product.id] ?? 0;

    if (quantity <= 0) {
      continue;
    }

    const { error } = await supabase
      .from("products")
      .update({
        stock: product.stock - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      return {
        success: false as const,
        message: "Pedido criado, mas nao foi possivel atualizar o estoque automaticamente.",
      };
    }
  }

  return { success: true as const };
}

async function decrementTrackedVariantStock(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  variants: { id: string; stock: number }[],
  quantitiesByVariantId: Record<string, number>
) {
  for (const variant of variants) {
    const quantity = quantitiesByVariantId[variant.id] ?? 0;

    if (quantity <= 0) {
      continue;
    }

    const { error } = await supabase
      .from("product_variants")
      .update({
        stock: variant.stock - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variant.id);

    if (error) {
      return {
        success: false as const,
        message: "Pedido criado, mas nao foi possivel atualizar o estoque da variacao automaticamente.",
      };
    }
  }

  return { success: true as const };
}

export async function createOrderAction(input: ServerCreateOrderInput) {
  const supabase = createSupabaseAdminClient();
  const quantitiesByVariantId = getTrackedVariantQuantities(input.items);
  const quantitiesByProductId = getTrackedQuantities(input.items);
  const variantStockValidation = await validateTrackedVariantStock(
    supabase,
    quantitiesByVariantId
  );

  if (!variantStockValidation.success) {
    return { success: false, message: variantStockValidation.message };
  }

  const stockValidation = await validateTrackedStock(supabase, quantitiesByProductId);

  if (!stockValidation.success) {
    return { success: false, message: stockValidation.message };
  }

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
    product_id: normalizeProductId(item.productId),
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

  const stockUpdate = await decrementTrackedStock(
    supabase,
    stockValidation.products ?? [],
    quantitiesByProductId
  );

  if (!stockUpdate.success) {
    return { success: false, message: stockUpdate.message };
  }

  const variantStockUpdate = await decrementTrackedVariantStock(
    supabase,
    variantStockValidation.variants ?? [],
    quantitiesByVariantId
  );

  if (!variantStockUpdate.success) {
    return { success: false, message: variantStockUpdate.message };
  }

  return { success: true, order };
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const supabase = createSupabaseAdminClient();

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
