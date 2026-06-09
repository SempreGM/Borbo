"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  defaultHeroBannerSettings,
  HERO_BANNER_STORAGE_KEY,
  HeroBannerSettings,
  normalizeHeroBannerSettings,
} from "@/lib/heroBanner";
import { getHeroBannerSettings } from "@/services/settings";

export default function HeroBanner() {
  const [settings, setSettings] = useState<HeroBannerSettings>(
    defaultHeroBannerSettings
  );

  useEffect(() => {
    const loadSettings = () => {
      getHeroBannerSettings()
        .then(setSettings)
        .catch(() => {
          const savedSettings = localStorage.getItem(HERO_BANNER_STORAGE_KEY);

          if (!savedSettings) {
            setSettings(defaultHeroBannerSettings);
            return;
          }

          try {
            const parsedSettings = JSON.parse(savedSettings) as HeroBannerSettings;
            setSettings(normalizeHeroBannerSettings(parsedSettings));
          } catch {
            localStorage.removeItem(HERO_BANNER_STORAGE_KEY);
            setSettings(defaultHeroBannerSettings);
          }
        });
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);

    return () => window.removeEventListener("storage", loadSettings);
  }, []);

  const imageUrls =
    settings.imageUrls.length > 0
      ? settings.imageUrls
      : defaultHeroBannerSettings.imageUrls;
  const backgroundGridColumns = {
    gridTemplateColumns: `repeat(${Math.min(Math.max(imageUrls.length, 1), 5)}, minmax(0, 1fr))`,
  };

  return (
    <section className="relative min-h-[620px] overflow-hidden px-4 py-12 sm:py-16 lg:px-8">
      <div className="absolute inset-0">
        <div
          className="grid h-full gap-2 opacity-90"
          style={backgroundGridColumns}
          aria-hidden="true"
        >
          {imageUrls.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              className={`relative overflow-hidden ${
                index % 2 === 0 ? "translate-y-8" : "-translate-y-8"
              }`}
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
        <div className="absolute inset-0 bg-white/35" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-4xl flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {settings.eyebrow}
        </p>
        <h1 className="mt-5 text-primary leading-tight text-4xl font-semibold tracking-normal text-balance sm:text-5xl lg:text-6xl">
          {settings.title}
        </h1>
        <p className="mt-5 text-foreground text-base max-w-3xl text-balance sm:text-lg">
          {settings.description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={settings.primaryButtonHref}>
              {settings.primaryButtonLabel}
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white/80 backdrop-blur-sm">
            <a
              href={settings.instagramHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
