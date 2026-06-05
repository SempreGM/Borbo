"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Bell, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useWishlistStore } from "@/components/home/useWishlistStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  type: string;
  details: Record<string, string>;
};

export default function Header() {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const adminNotifications: NotificationItem[] = [
    {
      id: 1,
      title: "Novo pedido recebido",
      description: "Cliente Maria Silva comprou Vestido Midi Aurora.",
      type: "order",
      details: {
        "Endereço de entrega": "Rua das Flores, 123 - Jardim Primavera, São Paulo/SP",
        CEP: "01234-567",
        Telefone: "+55 (11) 98765-4321",
        CPF: "123.456.789-00",
      },
    },
    {
      id: 2,
      title: "Mensagem de contato",
      description: "Cliente pediu informações sobre prazo de entrega.",
      type: "contact",
      details: {
        "Nome do cliente": "Ana Beatriz",
        Email: "ana.beatriz@email.com",
        Telefone: "+55 (21) 99876-5432",
      },
    },
  ];

  const customerNotifications: NotificationItem[] = [
    {
      id: 1,
      title: "Pedido confirmado",
      description: "Seu pedido #B-1024 foi confirmado.",
      type: "order_status",
      details: {
        "Número do pedido": "#B-1024",
        Status: "Confirmado",
        Data: new Date(Date.now() - 3600000).toLocaleString("pt-BR"),
      },
    },
  ];

  const notifications = user?.role === "admin" ? adminNotifications : customerNotifications;
  const unreadCount = notifications.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen((prev) => !prev);
    setSelectedNotification(null);
  }, []);

  const handleSelectNotification = useCallback(
    (notification: NotificationItem) => {
      setSelectedNotification(notification);
    },
    []
  );

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const isActivePath = (path: string) => pathname === path;

  const navItems = [
    { href: "/shop", label: "Loja" },
    { href: "/#colecao", label: "Coleção" },
    { href: "/about", label: "Quem somos" },
    { href: "/contact", label: "Contato" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-6 lg:gap-10">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link
              className="text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
              href="/"
              aria-label="borbô Home"
            >
              borbô
            </Link>

            <nav
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Navegação principal"
            >
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(href)
                      ? "bg-rose-100 shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={isActivePath(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl">
            <form action="/shop" method="GET" className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
              <input
                type="search"
                name="q"
                placeholder="Buscar vestidos, blusas e looks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm border border-rose-200 rounded-full bg-white text-rose-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                aria-label="Buscar produtos"
              />
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            <Link
              href="/favoritos"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
              aria-label={`Favoritos com ${wishlistCount} produtos`}
            >
              <Heart className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                  aria-label={`${wishlistCount} favoritos`}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
              aria-label={`Carrinho de compras com ${cartCount} itens`}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                  aria-label={`${cartCount} itens no carrinho`}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Notificações"
                >
                  <Bell className="h-6 w-6 text-gray-700 hover:text-gray-900 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-[18px] h-5 flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-3xl border border-border bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                      <p className="text-sm font-semibold text-foreground">Notificações</p>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleSelectNotification(notification)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                      {selectedNotification ? (
                        <>
                          <p className="text-sm font-semibold text-foreground mb-3">
                            Detalhes
                          </p>
                          <div className="space-y-3 text-sm text-muted-foreground mb-3">
                            {Object.entries(selectedNotification.details).map(
                              ([key, value]) => (
                                <div key={key} className="flex flex-wrap gap-1">
                                  <span className="font-medium text-foreground">{key}:</span>
                                  <span className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{value}</span>
                                </div>
                              )
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Selecione uma notificação acima para ver os detalhes.</p>
                      )}
                      {user?.role === "admin" && (
                        <div className="text-right mt-3 pt-3 border-t border-slate-200">
                          <Link
                            href="/admin"
                            className="text-sm font-medium text-primary hover:text-primary/80"
                          >
                            Ver todas
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="hidden sm:flex items-center space-x-2 relative">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    title="Conta do usuário"
                    onClick={toggleUserMenu}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-6 w-6 text-primary" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-3xl border border-border bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="flex flex-col">
                        <Link
                          href="/perfil"
                          className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-slate-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Minha conta
                        </Link>
                        {user?.role === "admin" ? (
                          <Link
                            href="/admin"
                            className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-slate-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Painel
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-foreground transition-colors hover:bg-slate-100"
                        >
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/entrar">Entrar</Link>
                  </Button>
                  <Button size="sm" variant="default" asChild>
                    <Link href="/cadastrar">Cadastrar</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isMobileOpen && (
          <nav
            className="md:hidden mt-4 animate-in slide-in-from-top duration-200"
            role="navigation"
            aria-label="Navegação mobile"
          >
            <div className="flex flex-col space-y-3 pb-4 border-b border-gray-200">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-all ${
                    isActivePath(href)
                      ? "bg-rose-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  aria-current={isActivePath(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>

            <form action="/shop" method="GET" className="relative my-4">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
              <input
                type="search"
                name="q"
                placeholder="Buscar produtos"
                className="w-full rounded-full border border-rose-200 bg-white py-3 pl-11 pr-4 text-sm text-rose-900"
              />
            </form>

            <div className="flex flex-col space-y-3 pt-4 sm:hidden">
              {user ? (
                <>
                  <Button variant="outline" className="w-full text-sm" asChild>
                    <Link href="/perfil" onClick={closeMobileMenu}>
                      Minha conta
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full text-sm" asChild>
                    <Link href="/entrar" onClick={closeMobileMenu}>
                      Entrar
                    </Link>
                  </Button>
                  <Button className="w-full text-sm" variant="default" asChild>
                    <Link href="/cadastrar" onClick={closeMobileMenu}>
                      Cadastrar
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
