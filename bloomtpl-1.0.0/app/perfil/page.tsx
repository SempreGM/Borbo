"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const notifications = [
    {
      id: 1,
      title: "Pedido confirmado",
      description: "Seu pedido #B-1024 foi confirmado.",
      status: "Confirmado",
      date: "12/05/2026 10:30",
    },
    {
      id: 2,
      title: "Pedido enviado",
      description: "Seu pedido #B-1024 foi despachado.",
      status: "Enviado",
      date: "13/05/2026 14:15",
      trackingCode: "BR123456789BR",
    },
    {
      id: 3,
      title: "Pedido em trânsito",
      description: "Seu pedido #B-1024 está a caminho.",
      status: "Em transporte",
      date: "14/05/2026 08:00",
    },
  ];

  const orders = [
    {
      id: "#B-1024",
      date: "12/05/2026",
      total: 349.9,
      status: "Entregue",
      items: 3,
      products: [
        { name: "Vestido Seda borbô", quantity: 1, price: 169.9 },
        { name: "Blusa Vintage", quantity: 1, price: 89.0 },
        { name: "Acessório Luxo", quantity: 1, price: 91.0 },
      ],
    },
    {
      id: "#B-1018",
      date: "28/04/2026",
      total: 189.0,
      status: "Em transporte",
      items: 2,
      products: [
        { name: "Macacão Preto", quantity: 1, price: 129.0 },
        { name: "Cinto Couro", quantity: 1, price: 60.0 },
      ],
    },
    {
      id: "#B-1007",
      date: "14/03/2026",
      total: 429.5,
      status: "Entregue",
      items: 4,
      products: [
        { name: "Casaco Elegante", quantity: 1, price: 239.5 },
        { name: "Calça Alfaiataria", quantity: 1, price: 120.0 },
        { name: "Meia-Fina", quantity: 2, price: 35.0 },
      ],
    },
  ];

  useEffect(() => {
    if (!user) {
      router.replace("/entrar");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

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
          Bem-vindo de volta, {user.name}. Aqui você pode ver seu perfil e sair
          da conta.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">E-mail</h2>
            <p className="text-foreground">{user.email}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Notificações de pedidos</h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-3xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {notification.status}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    {notification.trackingCode && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Código de rastreamento: {notification.trackingCode}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-right">{notification.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Histórico de compras</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pedido</p>
                    <p className="font-semibold text-foreground">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-semibold text-foreground">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Itens</p>
                    <p className="font-semibold text-foreground">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center gap-4 sm:justify-end">
                  <span className="text-sm text-muted-foreground">
                    Clique em "Ver detalhes" para visualizar os itens comprados.
                  </span>
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
                      {order.products.map((product) => (
                        <div
                          key={product.name}
                          className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {product.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
