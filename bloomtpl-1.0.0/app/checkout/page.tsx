"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MapPin, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/services/orders";
import type { PaymentMethod } from "@/lib/supabase/types";

type CheckoutErrors = Partial<Record<
  | "name"
  | "email"
  | "phone"
  | "zipCode"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state"
  | "paymentMethod",
  string
>>;

const paymentLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  card: "Cartão de crédito",
  transfer: "Transferência bancária",
};

const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [cpf, setCpf] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [backendWarning, setBackendWarning] = useState("");

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const shipping = subtotal > 250 ? 0 : 19.9;
  const total = subtotal + shipping;

  const validateForm = () => {
    const nextErrors: CheckoutErrors = {};
    const phoneDigits = phone.replace(/\D/g, "");
    const zipDigits = zipCode.replace(/\D/g, "");

    if (!name.trim()) nextErrors.name = "Informe seu nome completo.";
    if (!email.trim() || !email.includes("@")) nextErrors.email = "Informe um e-mail válido.";
    if (phoneDigits.length < 10) nextErrors.phone = "Informe um telefone válido.";
    if (zipDigits.length !== 8) nextErrors.zipCode = "Informe um CEP válido.";
    if (!street.trim()) nextErrors.street = "Informe a rua.";
    if (!number.trim()) nextErrors.number = "Informe o número.";
    if (!neighborhood.trim()) nextErrors.neighborhood = "Informe o bairro.";
    if (!city.trim()) nextErrors.city = "Informe a cidade.";
    if (!state.trim()) nextErrors.state = "Informe o estado.";
    if (!paymentMethod) nextErrors.paymentMethod = "Escolha uma forma de pagamento.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCepBlur = async () => {
    const cepDigits = zipCode.replace(/\D/g, "");

    if (cepDigits.length !== 8) {
      return;
    }

    setIsFetchingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStreet(data.logradouro || street);
        setNeighborhood(data.bairro || neighborhood);
        setCity(data.localidade || city);
        setState(data.uf || state);
      }
    } finally {
      setIsFetchingCep(false);
    }
  };

  const saveLocalFallbackOrder = (generatedOrderId: string) => {
    localStorage.setItem(
      "borboLastOrder",
      JSON.stringify({
        id: generatedOrderId,
        customer: { name, email, phone, cpf },
        shippingAddress: {
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
        },
        paymentMethod,
        notes,
        items: cart,
        subtotal,
        shipping,
        total,
        status: "received",
        createdAt: new Date().toISOString(),
      })
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setBackendWarning("");

    try {
      const { order } = await createOrder({
        userId: user?.id ?? null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerCpf: cpf || null,
        shippingAddress: {
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
        },
        paymentMethod,
        notes: notes || null,
        subtotal,
        shippingCost: shipping,
        total,
        items: cart.map((item) => ({
          productId: null,
          productName: item.name,
          productImage: item.image,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
      });

      setOrderId(`#${order.order_number}`);
    } catch {
      const fallbackOrderId = `#B-${Date.now().toString().slice(-6)}`;
      saveLocalFallbackOrder(fallbackOrderId);
      setOrderId(fallbackOrderId);
      setBackendWarning(
        "Pedido salvo localmente enquanto o Supabase não está configurado neste ambiente."
      );
    } finally {
      setIsSubmitting(false);
    }

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
            <Link href="/shop">Voltar para a loja</Link>
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
            <CheckCircle className="mx-auto h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Pedido recebido!
          </h1>
          <p className="text-muted-foreground mb-3">
            Seu pedido {orderId} foi registrado com sucesso.
          </p>
          <p className="text-muted-foreground mb-6">
            Enviaremos a confirmação e os próximos passos para {email}.
          </p>
          {backendWarning ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {backendWarning}
            </div>
          ) : null}
          <div className="mb-8 rounded-3xl border border-border bg-background p-5 text-left">
            <p className="text-sm font-semibold text-foreground mb-2">
              Forma de pagamento
            </p>
            <p className="text-sm text-muted-foreground">
              {paymentLabels[paymentMethod]} selecionado. A cobrança real será
              conectada ao gateway de pagamento na integração final.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/shop">Continuar comprando</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/perfil">Ver minha conta</Link>
            </Button>
          </div>
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

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-foreground mb-3">Finalizar pedido</h1>
            <p className="text-muted-foreground mb-6">
              Preencha seus dados para concluir a compra com segurança.
            </p>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Dados de contato
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nome completo
                    </label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email}</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(event) => setPhone(formatPhone(event.target.value))}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone}</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      CPF opcional
                    </label>
                    <Input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(event) => setCpf(formatCpf(event.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Endereço de entrega
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      CEP
                    </label>
                    <Input
                      type="text"
                      placeholder="00000-000"
                      value={zipCode}
                      onBlur={handleCepBlur}
                      onChange={(event) => setZipCode(formatCep(event.target.value))}
                      aria-invalid={Boolean(errors.zipCode)}
                    />
                    {errors.zipCode ? <p className="mt-1 text-xs text-destructive">{errors.zipCode}</p> : null}
                    {isFetchingCep ? <p className="mt-1 text-xs text-muted-foreground">Buscando CEP...</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Rua
                    </label>
                    <Input
                      type="text"
                      placeholder="Rua"
                      value={street}
                      onChange={(event) => setStreet(event.target.value)}
                      aria-invalid={Boolean(errors.street)}
                    />
                    {errors.street ? <p className="mt-1 text-xs text-destructive">{errors.street}</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Número
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={number}
                      onChange={(event) => setNumber(event.target.value)}
                      aria-invalid={Boolean(errors.number)}
                    />
                    {errors.number ? <p className="mt-1 text-xs text-destructive">{errors.number}</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Complemento
                    </label>
                    <Input
                      type="text"
                      placeholder="Apartamento, bloco, referência"
                      value={complement}
                      onChange={(event) => setComplement(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Bairro
                    </label>
                    <Input
                      type="text"
                      placeholder="Bairro"
                      value={neighborhood}
                      onChange={(event) => setNeighborhood(event.target.value)}
                      aria-invalid={Boolean(errors.neighborhood)}
                    />
                    {errors.neighborhood ? <p className="mt-1 text-xs text-destructive">{errors.neighborhood}</p> : null}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_96px]">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Cidade
                      </label>
                      <Input
                        type="text"
                        placeholder="Cidade"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        aria-invalid={Boolean(errors.city)}
                      />
                      {errors.city ? <p className="mt-1 text-xs text-destructive">{errors.city}</p> : null}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        UF
                      </label>
                      <Input
                        type="text"
                        placeholder="SP"
                        value={state}
                        maxLength={2}
                        onChange={(event) => setState(event.target.value.toUpperCase())}
                        aria-invalid={Boolean(errors.state)}
                      />
                      {errors.state ? <p className="mt-1 text-xs text-destructive">{errors.state}</p> : null}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Pagamento
                </h2>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Forma de pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                    className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="pix">Pix</option>
                    <option value="card">Cartão de crédito</option>
                    <option value="transfer">Transferência bancária</option>
                  </select>
                  {errors.paymentMethod ? <p className="mt-1 text-xs text-destructive">{errors.paymentMethod}</p> : null}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  A cobrança real será conectada ao gateway de pagamento na
                  próxima etapa de integração.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Observações
                </label>
                <Textarea
                  placeholder="Observações de entrega, preferência de contato, etc."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
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
          </section>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
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
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <Button
              type="submit"
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              <PackageCheck className="h-4 w-4" />
              {isSubmitting ? "Registrando..." : "Confirmar pedido"}
            </Button>

            <div className="mt-6 rounded-2xl border border-border bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Informações de entrega
              </h3>
              <p className="text-sm text-muted-foreground">
                Frete grátis para pedidos acima de R$250. Prazo de entrega de 3
                a 5 dias úteis.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
