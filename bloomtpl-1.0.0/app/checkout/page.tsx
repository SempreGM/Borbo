"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  PackageCheck,
  QrCode,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createOrderAction } from "@/app/actions/orders";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { updateProfile } from "@/services/profiles";
import { calculateCouponDiscount, getCouponByCode } from "@/services/coupons";
import {
  calculateShippingCost,
  defaultShippingSettings,
  normalizeShippingSettings,
  SHIPPING_SETTINGS_STORAGE_KEY,
  type ShippingSettings,
} from "@/lib/shippingSettings";
import { getShippingSettings } from "@/services/settings";
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
  card: "Cartão de crédito ou débito",
  transfer: "Transferência bancária",
};

const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  detail: string;
  icon: typeof QrCode;
}> = [
  {
    value: "pix",
    label: "Pix",
    description: "Aprovação rápida",
    detail: "Código Pix gerado após o pedido.",
    icon: QrCode,
  },
  {
    value: "card",
    label: "Cartão",
    description: "Crédito ou débito",
    detail: "Crédito em até 12x ou débito à vista.",
    icon: CreditCard,
  },
];

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

const isSupabaseProductId = (productId: string | number): productId is string => {
  return typeof productId === "string" && productId.length >= 30;
};

export default function CheckoutPage() {
  const {
    cart,
    clearCart,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
  } = useCart();
  const { user, refreshUser } = useAuth();
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
  const [submitError, setSubmitError] = useState("");
  const [cepError, setCepError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(
    defaultShippingSettings
  );

  useEffect(() => {
    getShippingSettings()
      .then(setShippingSettings)
      .catch(() => {
        const savedSettings = localStorage.getItem(SHIPPING_SETTINGS_STORAGE_KEY);

        if (!savedSettings) {
          return;
        }

        try {
          setShippingSettings(normalizeShippingSettings(JSON.parse(savedSettings)));
        } catch {
          localStorage.removeItem(SHIPPING_SETTINGS_STORAGE_KEY);
        }
      });
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const discount = useMemo(
    () => (appliedCoupon ? calculateCouponDiscount(appliedCoupon, subtotal) : 0),
    [appliedCoupon, subtotal]
  );
  const shipping = calculateShippingCost(subtotal, shippingSettings);
  const total = Math.max(0, subtotal - discount) + shipping;
  const validationErrorCount = Object.keys(errors).length;

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim();

    if (!normalizedCode) {
      setCouponError("Informe um cupom.");
      setCouponMessage("");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const coupon = await getCouponByCode(normalizedCode);

      if (!coupon) {
        setCouponError("Cupom não encontrado ou inativo.");
        return;
      }

      if (subtotal < coupon.min_purchase) {
        setCouponError(
          `Este cupom exige compra mínima de ${formatCurrency(coupon.min_purchase)}.`
        );
        return;
      }

      applyCoupon({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase: coupon.min_purchase,
        active: coupon.active,
      });
      setCouponCode("");
      setCouponMessage("Cupom aplicado com sucesso.");
    } catch {
      setCouponError("Não foi possível aplicar o cupom agora.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

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
    const hasErrors = Object.keys(nextErrors).length > 0;

    if (hasErrors) {
      setSubmitError("Revise os campos obrigatórios destacados antes de confirmar o pedido.");
    }

    return !hasErrors;
  };

  const fetchAddressByCep = async (cepValue: string) => {
    const cepDigits = cepValue.replace(/\D/g, "");

    if (cepDigits.length !== 8) {
      return;
    }

    setIsFetchingCep(true);
    setCepError("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado. Confira o número informado.");
        return;
      }

      if (response.ok) {
        setStreet(data.logradouro || street);
        setNeighborhood(data.bairro || neighborhood);
        setCity(data.localidade || city);
        setState(String(data.uf || "").toUpperCase());
      }
    } catch {
      setCepError("Não foi possível buscar o CEP agora. Preencha o endereço manualmente.");
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formattedCep = formatCep(value);
    const cepDigits = formattedCep.replace(/\D/g, "");

    setZipCode(formattedCep);
    setCepError("");

    if (cepDigits.length === 8) {
      void fetchAddressByCep(formattedCep);
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
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discount,
            }
          : null,
        items: cart,
        subtotal,
        discount,
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
    setSubmitError("");

    try {
      const orderNotes = [
        notes.trim() || null,
        appliedCoupon && discount > 0
          ? `Cupom ${appliedCoupon.code} aplicado: -${formatCurrency(discount)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      const response = await createOrderAction({
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
        notes: orderNotes || null,
        subtotal,
        shippingCost: shipping,
        total,
        items: cart.map((item) => ({
          productId: isSupabaseProductId(item.id) ? item.id : null,
          variantId: item.variantId ?? null,
          productName:
            item.size || item.color
              ? `${item.name} (${[item.size ? `Tam. ${item.size}` : null, item.color].filter(Boolean).join(" • ")})`
              : item.name,
          productImage: item.image,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
      });

      if (!response.success || !response.order) {
        setSubmitError(response.message ?? "Nao foi possivel registrar seu pedido agora.");
        setIsSubmitting(false);
        return;
      }

      setOrderId(`#${response.order.order_number}`);

      if (user?.id && phone.trim() && phone.trim() !== (user.phone ?? "")) {
        await updateProfile(user.id, { phone: phone.trim() });
        await refreshUser();
      }
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
            {submitError ? (
              <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {submitError}
                {validationErrorCount > 0 ? (
                  <span className="mt-1 block font-normal">
                    {validationErrorCount} {validationErrorCount === 1 ? "campo precisa" : "campos precisam"} de atenção.
                  </span>
                ) : null}
              </div>
            ) : null}

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
                      onBlur={() => void fetchAddressByCep(zipCode)}
                      onChange={(event) => handleCepChange(event.target.value)}
                      aria-invalid={Boolean(errors.zipCode)}
                    />
                    {errors.zipCode ? <p className="mt-1 text-xs text-destructive">{errors.zipCode}</p> : null}
                    {cepError ? <p className="mt-1 text-xs text-destructive">{cepError}</p> : null}
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
                  <p className="text-sm font-medium text-foreground mb-3">
                    Forma de pagamento
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = paymentMethod === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPaymentMethod(option.value)}
                          className={`min-h-[132px] rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                              : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-white"
                              }`}
                            >
                              {isSelected ? <CheckCircle className="h-4 w-4" /> : null}
                            </span>
                          </div>
                          <p className="font-semibold text-foreground">{option.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {option.description}
                          </p>
                          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            {option.detail}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.paymentMethod ? <p className="mt-1 text-xs text-destructive">{errors.paymentMethod}</p> : null}
                </div>
                <p className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  A cobrança real será conectada ao gateway de pagamento na próxima etapa de integração.
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
              {cart.map((item) => {
                const itemKey = item.cartKey ?? item.id;

                return (
                <div key={itemKey} className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-3xl overflow-hidden bg-muted">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                    {(item.size || item.color) ? (
                      <p className="text-xs text-muted-foreground">
                        {[item.size ? `Tam. ${item.size}` : null, item.color].filter(Boolean).join(" • ")}
                      </p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">{item.quantity}x • {formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(itemKey)}
                      aria-label={`Remover ${item.name} do pedido`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden text-xs font-medium sm:inline">Remover</span>
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Resumo do pedido</h2>

            <div className="mb-5 rounded-2xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <Tag className="h-4 w-4 text-primary" />
                Cupom de desconto
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {discount > 0
                        ? `${formatCurrency(discount)} de desconto`
                        : "Cupom aguardando valor mínimo"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      clearCoupon();
                      setCouponMessage("");
                      setCouponError("");
                    }}
                    aria-label="Remover cupom"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Digite o cupom"
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                  >
                    {isApplyingCoupon ? "..." : "Aplicar"}
                  </Button>
                </div>
              )}

              {couponError ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {couponError}
                </p>
              ) : null}
              {couponMessage ? (
                <p className="mt-2 text-xs font-medium text-primary">
                  {couponMessage}
                </p>
              ) : null}
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{shipping === 0 ? "Grátis" : formatCurrency(shipping)}</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-primary">
                  <span>Desconto ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              ) : null}
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
            {submitError ? (
              <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {submitError}
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-border bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Informações de entrega
              </h3>
              <p className="text-sm text-muted-foreground">
                {shippingSettings.freeShippingEnabled
                  ? `Frete grátis para pedidos acima de ${formatCurrency(shippingSettings.freeShippingMinPurchase)}. `
                  : ""}
                Prazo de entrega de {shippingSettings.deliveryEstimate}.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
