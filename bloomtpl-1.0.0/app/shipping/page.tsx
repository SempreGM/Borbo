"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  defaultShippingSettings,
  normalizeShippingSettings,
  SHIPPING_SETTINGS_STORAGE_KEY,
  type ShippingSettings,
} from "@/lib/shippingSettings";
import { getShippingSettings } from "@/services/settings";
import { formatCurrency } from "@/lib/utils";

export default function ShippingPage() {
  const [cep, setCep] = useState("");
  const [feedback, setFeedback] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
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

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const handleCheckCep = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cepDigits = cep.replace(/\D/g, "");

    if (cepDigits.length !== 8) {
      setFeedback("Por favor, digite um CEP válido com 8 dígitos.");
      setAddress("");
      setCity("");
      setState("");
      return;
    }

    setLoading(true);
    setFeedback("");
    setAddress("");
    setCity("");
    setState("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();

      if (data.erro) {
        setFeedback("CEP não encontrado. Verifique e tente novamente.");
      } else {
        setAddress(data.logradouro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
        setFeedback(
          `Entrega estimada para o CEP ${cep}: ${shippingSettings.deliveryEstimate}. Valor do frete calculado no checkout.`
        );
      }
    } catch {
      setFeedback("Não foi possível buscar o CEP no momento. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Frete</h1>
        <p className="text-muted-foreground mb-6">
          Digite seu CEP para verificar prazos e disponibilidade de entrega.
        </p>
        <div className="mb-6 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
          Frete padrão: {formatCurrency(shippingSettings.baseShippingCost)}.
          {shippingSettings.freeShippingEnabled
            ? ` Frete grátis acima de ${formatCurrency(shippingSettings.freeShippingMinPurchase)}.`
            : " Frete grátis desativado no momento."}
        </div>

        <form onSubmit={handleCheckCep} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Input
              type="text"
              placeholder="Digite seu CEP"
              value={cep}
              onChange={(event) => setCep(formatCep(event.target.value))}
              maxLength={9}
              className="w-full"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Consultar CEP"}
            </Button>
          </div>

          {address ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground">
                <p className="font-medium text-foreground mb-2">Endereço encontrado</p>
                <div className="space-y-3">
                  <Input value={address} readOnly className="cursor-not-allowed bg-muted" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input value={city} readOnly className="cursor-not-allowed bg-muted" />
                    <Input value={state} readOnly className="cursor-not-allowed bg-muted" />
                  </div>
                </div>
              </div>
              {feedback ? (
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground">
                  {feedback}
                </div>
              ) : null}
            </div>
          ) : feedback ? (
            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground">
              {feedback}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
