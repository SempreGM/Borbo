export type PaymentGatewayStatus = {
  provider: "mercado_pago";
  enabled: boolean;
  publicKey?: string;
};

export function getMercadoPagoStatus(): PaymentGatewayStatus {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
  const gateway = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY;

  return {
    provider: "mercado_pago",
    enabled: gateway === "mercado_pago" && Boolean(accessToken && publicKey),
    publicKey: publicKey || undefined,
  };
}

export function assertMercadoPagoConfigured() {
  const status = getMercadoPagoStatus();

  if (!status.enabled) {
    throw new Error(
      "Mercado Pago ainda nao esta configurado. Use as credenciais oficiais da loja."
    );
  }

  return status;
}
