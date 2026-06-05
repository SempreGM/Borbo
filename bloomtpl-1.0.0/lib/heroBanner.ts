import products from "@/data/products.json";

export const HERO_BANNER_STORAGE_KEY = "borboHeroBanner";
export const MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL = "2 MB";

export type HeroBannerSettings = {
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  instagramHref: string;
  imageUrls: string[];
};

export const defaultHeroBannerSettings: HeroBannerSettings = {
  eyebrow: "Coleções leves, descontos especiais e novidades da semana",
  title: "Vista sua melhor versão com a borbô",
  description:
    "Peças femininas elegantes e versáteis para acompanhar sua rotina com conforto, confiança e um toque de sofisticação.",
  primaryButtonLabel: "Ver coleção",
  primaryButtonHref: "/shop",
  instagramHref: "https://www.instagram.com/seja.borbo/",
  imageUrls: products.slice(0, 5).map((product) => product.image),
};

export function normalizeHeroBannerSettings(
  settings: HeroBannerSettings
): HeroBannerSettings {
  return {
    ...defaultHeroBannerSettings,
    ...settings,
    imageUrls: settings.imageUrls.filter(Boolean).slice(0, 5),
  };
}
