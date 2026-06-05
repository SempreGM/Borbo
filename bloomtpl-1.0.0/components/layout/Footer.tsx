"use client";

import { Heart, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  defaultFooterSettings,
  FOOTER_SETTINGS_STORAGE_KEY,
  FooterSettings,
  normalizeFooterSettings,
} from "@/lib/footerSettings";
import { getFooterSettings } from "@/services/settings";

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);

  useEffect(() => {
    const loadSettings = () => {
      getFooterSettings()
        .then(setSettings)
        .catch(() => {
          const savedSettings = localStorage.getItem(FOOTER_SETTINGS_STORAGE_KEY);

          if (!savedSettings) {
            setSettings(defaultFooterSettings);
            return;
          }

          try {
            setSettings(
              normalizeFooterSettings(JSON.parse(savedSettings) as FooterSettings)
            );
          } catch {
            localStorage.removeItem(FOOTER_SETTINGS_STORAGE_KEY);
            setSettings(defaultFooterSettings);
          }
        });
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);

    return () => window.removeEventListener("storage", loadSettings);
  }, []);

  const footerSections = [
    {
      title: "Loja",
      links: [
        { href: "/shop", label: "Todos os produtos" },
        { href: "/shop", label: "Novidades" },
        { href: "/#colecao", label: "Coleção em destaque" },
        { href: "/about", label: "Quem somos" },
      ],
    },
    {
      title: "Atendimento",
      links: [
        { href: "/contact", label: "Fale conosco" },
        { href: "/shipping", label: "Frete" },
        { href: "/returns", label: "Trocas e devoluções" },
        { href: "/help", label: "Ajuda" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Política de privacidade" },
        { href: "/terms", label: "Termos e condições" },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 border-b border-border">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
            <Instagram className="h-10 w-10 text-primary" />
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {settings.instagramTitle}
              </h3>
              <p className="mt-3 text-muted-foreground">
                {settings.instagramDescription}
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a
                href={settings.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Seguir no Instagram
              </a>
            </Button>
          </div>
        </div>

        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Link
                className="text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
                href="/"
                aria-label="borbô Home"
              >
                borbô
              </Link>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {settings.brandDescription}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{settings.serviceLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{settings.email}</span>
                </div>
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{settings.copyrightText}</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidade
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
