export const SHIPPING_SETTINGS_STORAGE_KEY = "borboShippingSettings";

export type ShippingSettings = {
  baseShippingCost: number;
  freeShippingEnabled: boolean;
  freeShippingMinPurchase: number;
  deliveryEstimate: string;
};

export const defaultShippingSettings: ShippingSettings = {
  baseShippingCost: 19.9,
  freeShippingEnabled: true,
  freeShippingMinPurchase: 250,
  deliveryEstimate: "3 a 5 dias úteis",
};

const normalizeMoney = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0
    ? numberValue
    : fallback;
};

export function normalizeShippingSettings(
  settings: Partial<ShippingSettings> | null | undefined
): ShippingSettings {
  return {
    baseShippingCost: normalizeMoney(
      settings?.baseShippingCost,
      defaultShippingSettings.baseShippingCost
    ),
    freeShippingEnabled:
      settings?.freeShippingEnabled ?? defaultShippingSettings.freeShippingEnabled,
    freeShippingMinPurchase: normalizeMoney(
      settings?.freeShippingMinPurchase,
      defaultShippingSettings.freeShippingMinPurchase
    ),
    deliveryEstimate:
      settings?.deliveryEstimate?.trim() || defaultShippingSettings.deliveryEstimate,
  };
}

export function calculateShippingCost(
  subtotal: number,
  settings: ShippingSettings
) {
  if (
    settings.freeShippingEnabled &&
    subtotal >= settings.freeShippingMinPurchase
  ) {
    return 0;
  }

  return settings.baseShippingCost;
}
