"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const shipping = subtotal > 250 ? 0 : 19.9;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !address) return;
    clearCart();
    setOrderPlaced(true);
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Seu carrinho está vazio
          </h1>
          <p className="text-muted-foreground mb-8">
            Adicione produtos ao carrinho antes de finalizar sua compra.
          </p>
          <Button asChild>
            <Link href="/">Voltar para a loja</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-10 shadow-sm">
          <div className="mb-6">
            <CreditCard className="mx-auto h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Pedido confirmado!
          </h1>
          <p className="text-muted-foreground mb-6">
            Obrigado por comprar na Borbô. Em breve enviaremos a confirmação para o seu e-mail.
          </p>
          <Button asChild>
            <Link href="/">Continuar comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
          <ArrowLeft className="h-4 w-4" /> Voltar ao carrinho
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-foreground mb-3">Finalizar Pedido</h1>
            <p className="text-muted-foreground mb-6">
              Preencha seus dados para concluir a compra com segurança.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nome completo
                  </label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Endereço de entrega
                </label>
                <Textarea
                  placeholder="Rua, número, bairro, cidade, estado"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Observações
                </label>
                <Textarea
                  placeholder="Observações de entrega, cor preferida, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Confirmar pedido
              </Button>
            </form>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Itens do pedido</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-3xl overflow-hidden bg-muted">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.quantity}x • {formatCurrency(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Resumo do pedido</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{shipping === 0 ? "Grátis" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Imposto</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">Informações de entrega</h3>
            <p className="text-sm text-muted-foreground">
              Frete grátis para pedidos acima de R$250. Prazo de entrega de 3 a 5 dias úteis.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
