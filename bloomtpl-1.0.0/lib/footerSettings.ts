export const FOOTER_SETTINGS_STORAGE_KEY = "borboFooterSettings";

export type FooterSettings = {
  brandDescription: string;
  serviceLocation: string;
  phone: string;
  email: string;
  instagramHref: string;
  instagramTitle: string;
  instagramDescription: string;
  copyrightText: string;
};

export const defaultFooterSettings: FooterSettings = {
  brandDescription:
    "Moda feminina leve, elegante e acessível para mulheres que querem expressar personalidade com confiança.",
  serviceLocation: "Atendimento online para todo o Brasil",
  phone: "(11) 4000-1234",
  email: "oi@borbo.com.br",
  instagramHref: "https://www.instagram.com/seja.borbo/",
  instagramTitle: "Acompanhe a borbô no Instagram",
  instagramDescription:
    "Veja novidades, bastidores, combinações e lançamentos pelo nosso perfil oficial.",
  copyrightText: "© 2026 borbô. Feito com carinho para vestir sua melhor versão.",
};

export function normalizeFooterSettings(settings: FooterSettings): FooterSettings {
  return {
    ...defaultFooterSettings,
    ...settings,
  };
}
