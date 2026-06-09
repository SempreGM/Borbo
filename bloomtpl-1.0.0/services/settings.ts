import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import {
  defaultFooterSettings,
  FooterSettings,
  normalizeFooterSettings,
} from "@/lib/footerSettings";
import {
  defaultHeroBannerSettings,
  HeroBannerSettings,
  normalizeHeroBannerSettings,
} from "@/lib/heroBanner";
import {
  defaultShippingSettings,
  normalizeShippingSettings,
  ShippingSettings,
} from "@/lib/shippingSettings";

const HERO_BANNER_KEY = "hero_banner";
const FOOTER_SETTINGS_KEY = "footer_settings";
const SHIPPING_SETTINGS_KEY = "shipping_settings";

async function getSetting<T>(key: string, fallback: T) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;

  return (data?.value as T | undefined) ?? fallback;
}

async function saveSetting(key: string, value: Json) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("site_settings")
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getHeroBannerSettings() {
  const settings = await getSetting<HeroBannerSettings>(
    HERO_BANNER_KEY,
    defaultHeroBannerSettings
  );

  return normalizeHeroBannerSettings(settings);
}

export async function saveHeroBannerSettings(settings: HeroBannerSettings) {
  return saveSetting(HERO_BANNER_KEY, normalizeHeroBannerSettings(settings) as Json);
}

export async function getFooterSettings() {
  const settings = await getSetting<FooterSettings>(
    FOOTER_SETTINGS_KEY,
    defaultFooterSettings
  );

  return normalizeFooterSettings(settings);
}

export async function saveFooterSettings(settings: FooterSettings) {
  return saveSetting(FOOTER_SETTINGS_KEY, normalizeFooterSettings(settings) as Json);
}

export async function getShippingSettings() {
  const settings = await getSetting<Partial<ShippingSettings>>(
    SHIPPING_SETTINGS_KEY,
    defaultShippingSettings
  );

  return normalizeShippingSettings(settings);
}

export async function saveShippingSettings(settings: ShippingSettings) {
  return saveSetting(
    SHIPPING_SETTINGS_KEY,
    normalizeShippingSettings(settings) as unknown as Json
  );
}
