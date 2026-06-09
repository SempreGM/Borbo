"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import {
  getCustomerOrder,
  type OrderItemRecord,
  type OrderRecord,
} from "@/services/orders";
import type { Json, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/supabase/types";

type CustomerOrder = OrderRecord & {
  order_items?: OrderItemRecord[];
};

const orderStatusLabels: Record<OrderStatus, string> = {
  received: "Recebido",
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em preparo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  card: "Cartão de crédito",
  transfer: "Transferência bancária",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  failed: "Recusado",
  refunded: "Reembolsado",
};

function formatShippingAddress(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return "Endereço não informado";
  }

  const shippingAddress = address as Record<string, string | undefined>;
  return [
    shippingAddress.street,
    shippingAddress.number,
    shippingAddress.complement,
    shippingAddress.neighborhood,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function OrderDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/entrar");
      return;
    }

    const orderId = decodeURIComponent(params.orderId);
    setIsLoading(true);
    setError("");

    getCustomerOrder(user.id, orderId)
      .then((customerOrder) => {
        if (!customerOrder) {
          setError("Pedido não encontrado.");
          setOrder(null);
          return;
        }

        setOrder(customerOrder as CustomerOrder);
      })
      .catch(() => {
        setError("Não foi possível carregar os detalhes do pedido agora.");
      })
      .finally(() => setIsLoading(false));
  }, [params.orderId, router, user]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
          <p className="text-sm text-muted-foreground">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
          <h1 className="mb-3 text-3xl font-bold text-foreground">Pedido não encontrado</h1>
          <p className="mb-8 text-muted-foreground">{error || "Não encontramos esse pedido na sua conta."}</p>
          <Button variant="outline" asChild>
            <Link href="/perfil">Voltar à minha conta</Link>
          </Button>
        </div>
      </div>
    );
  }

  const itemCount = (order.order_items ?? []).reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Detalhes do pedido</h1>
            <p className="text-muted-foreground">Pedido #{order.order_number}</p>
          </div>
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {orderStatusLabels[order.status]}
          </span>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Data</h2>
            <p className="text-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Itens</h2>
            <p className="text-foreground">{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Pagamento</h2>
            <p className="text-foreground">
              {paymentMethodLabels[order.payment_method]} • {paymentStatusLabels[order.payment_status]}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Total</h2>
            <p className="font-semibold text-foreground">{formatCurrency(order.total)}</p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">Itens do pedido</h2>
          <div className="space-y-4">
            {(order.order_items ?? []).map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{product.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity}x {formatCurrency(product.unit_price)}
                  </p>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(product.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Entrega</h2>
            <p className="text-sm text-muted-foreground">{formatShippingAddress(order.shipping_address)}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Resumo</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{order.shipping_cost === 0 ? "Grátis" : formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {order.notes ? (
          <div className="mb-8 rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-2 text-lg font-semibold">Observações</h2>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href="/perfil">Voltar à minha conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
