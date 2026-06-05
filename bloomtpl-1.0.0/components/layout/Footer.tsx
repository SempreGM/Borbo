"use client";

import { ArrowRight, Heart, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Newsletter subscription:", email);
      setEmail("");
    }
  };

  const footerSections = [
    {
      title: "Loja",
      links: [
        { href: "/shop", label: "Todos os produtos" },
        { href: "/shop", label: "Novidades" },
        { href: "/shop", label: "Promoções" },
        { href: "/shop", label: "Destaques" },
        { href: "/about", label: "Quem somos" },
      ],
    },
    {
      title: "Atendimento",
      links: [
        { href: "/contact", label: "Fale Conosco" },
        { href: "/shipping", label: "Frete" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Política de Privacidade" },
        { href: "/terms", label: "Termos e Condições" },
      ],
    },
  ];

  const socialLinks = [
    { href: "https://www.instagram.com/seja.borbo/", icon: Instagram, label: "Instagram" },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 border-b border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Fique por dentro
            </h3>
            <p className="text-muted-foreground mb-6">
              Assine nossa newsletter para receber ofertas exclusivas, novidades
              e inspiração de estilo.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex max-w-md mx-auto gap-2"
            >
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Inscrever-se</span>
              </Button>
            </form>
          </div>
        </div>

        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Link
                className="text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
                href="/"
                aria-label="Borbô Home"
              >
                BORBÔ
              </Link>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Descubra produtos únicos que inspiram seu estilo. Qualidade e
                design moderno em cada peça.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>123 Fashion Street, Style City, SC 12345</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>oi@borbo.com.br</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-12 w-12 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon className="h-6 w-6" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {footerSections.map((section, index) => (
              <div
                key={section.title}
                className={`${index >= 2 ? "lg:col-span-1" : ""}`}
              >
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
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2025 Borbô™. Feito com</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>Todos os direitos reservados.</span>
              <br />
            </div>
            <p className="text-sm text-muted-foreground">Desenvolvido por <a href="https://github.com/bloomtpl" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">Bloomtpl</a> • Distribuído por <a href="https://themewagon.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">ThemeWagon</a></p>
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
