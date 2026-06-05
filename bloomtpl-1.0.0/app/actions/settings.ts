"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import {
  FooterSettings,
  normalizeFooterSettings,
} from "@/lib/footerSettings";
import {
  HeroBannerSettings,
  normalizeHeroBannerSettings,
} from "@/lib/heroBanner";

async function saveSettingAction(key: string, value: Json) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("site_settings")
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, setting: data };
}

export async function saveHeroBannerAction(settings: HeroBannerSettings) {
  return saveSettingAction(
    "hero_banner",
    normalizeHeroBannerSettings(settings) as Json
  );
}

export async function saveFooterSettingsAction(settings: FooterSettings) {
  return saveSettingAction(
    "footer_settings",
    normalizeFooterSettings(settings) as Json
  );
}
