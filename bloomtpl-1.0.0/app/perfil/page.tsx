"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { listCustomerOrders, type OrderItemRecord, type OrderRecord } from "@/services/orders";
import { updateProfile } from "@/services/profiles";
import type { OrderStatus } from "@/lib/supabase/types";

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

export default function ProfilePage() {
  const { user, refreshUser, signOut } = useAuth();
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneFeedback, setPhoneFeedback] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/entrar");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setIsLoadingOrders(true);
    setOrdersError("");

    listCustomerOrders(user.id)
      .then((customerOrders) => setOrders(customerOrders as CustomerOrder[]))
      .catch(() =>
        setOrdersError("Não foi possível carregar seus pedidos agora.")
      )
      .finally(() => setIsLoadingOrders(false));
  }, [user?.id]);

  useEffect(() => {
    setPhone(user?.phone ?? "");
  }, [user?.phone]);

  const handleSavePhone = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.id) {
      return;
    }

    setIsSavingPhone(true);
    setPhoneFeedback("");
    setPhoneError("");

    try {
      await updateProfile(user.id, { phone: phone.trim() || null });
      await refreshUser();
      setPhoneFeedback("Telefone atualizado com sucesso.");
    } catch {
      setPhoneError("Não foi possível atualizar seu telefone agora.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  if (!user) {
    return null;
  }

  const latestOrders = orders.slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Minha conta</h1>
        {user.role === "admin" ? (
          <div className="mb-4 inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
            Acesso MASTER de dono
          </div>
        ) : null}
        <p className="text-muted-foreground mb-8">
          Bem-vindo de volta, {user.name}. Aqui você acompanha seus dados e pedidos.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">E-mail</h2>
            <p className="text-foreground">{user.email}</p>
          </div>
          <form onSubmit={handleSavePhone} className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">Telefone</h2>
            <div className="flex flex-col gap-3">
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              {phoneFeedback ? <p className="text-sm text-primary">{phoneFeedback}</p> : null}
              {phoneError ? <p className="text-sm text-destructive">{phoneError}</p> : null}
              <Button type="submit" size="sm" disabled={isSavingPhone}>
                {isSavingPhone ? "Salvando..." : "Salvar telefone"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Atualizações de pedidos</h2>
          {isLoadingOrders ? (
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
          ) : ordersError ? (
            <p className="text-sm text-destructive">{ordersError}</p>
          ) : latestOrders.length > 0 ? (
            <div className="space-y-3">
              {latestOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {orderStatusLabels[order.status]}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        Pedido #{order.order_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Última atualização: {new Date(order.updated_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Você ainda não possui pedidos registrados.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Histórico de compras</h2>
          {isLoadingOrders ? (
            <p className="text-sm text-muted-foreground">Carregando histórico...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const itemCount = (order.order_items ?? []).reduce(
                  (total, item) => total + item.quantity,
                  0
                );

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pedido</p>
                        <p className="font-semibold text-foreground">#{order.order_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data</p>
                        <p className="font-semibold text-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Itens</p>
                        <p className="font-semibold text-foreground">{itemCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                          {orderStatusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center gap-4 sm:justify-end">
                      <span className="text-sm text-muted-foreground">
                        Acompanhe aqui o status atualizado pelo atendimento.
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/perfil/pedidos/${order.order_number}`}>
                          Abrir pedido
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedOrder((current) =>
                            current === order.id ? null : order.id
                          )
                        }
                      >
                        {expandedOrder === order.id ? "Ocultar detalhes" : "Ver detalhes"}
                      </Button>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="mt-4 rounded-2xl border border-border bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                          Itens do pedido
                        </h3>
                        <div className="space-y-3">
                          {(order.order_items ?? []).map((product) => (
                            <div
                              key={product.id}
                              className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="font-semibold text-foreground">
                                  {product.product_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Quantidade: {product.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-foreground">
                                {formatCurrency(product.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Você ainda não realizou compras.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button variant="outline" asChild>
            <Link href="/shop">Voltar à loja</Link>
          </Button>
          <Button
            onClick={() => signOut()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
