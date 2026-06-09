"use client";

import { useWishlistStore } from "@/components/home/useWishlistStore";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Bell, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

const navItems = [
  { href: "/shop", label: "Loja" },
  { href: "/#colecao", label: "Colecao" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const syncWishlistWithUser = useWishlistStore((state) => state.syncWithUser);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    void syncWishlistWithUser(user?.id);
  }, [syncWishlistWithUser, user?.id]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setIsUserMenuOpen(false);
  }, [signOut]);

  const closeFloatingMenus = () => {
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur" : "bg-white/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-semibold tracking-[0.08em] text-stone-950">
          borbô
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-stone-700 transition-colors hover:text-stone-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="icon" aria-label="Buscar">
            <Link href="/shop">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {user && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Notificacoes"
                onClick={() => {
                  setIsNotificationsOpen((current) => !current);
                  setIsUserMenuOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
              </Button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="text-sm font-semibold text-stone-950">Notificacoes</p>
                  </div>
                  <div className="px-4 py-4">
                    {user.role === "admin" ? (
                      <>
                        <p className="text-sm font-medium text-stone-950">Pedidos da loja</p>
                        <p className="mt-1 text-sm text-stone-600">
                          Veja compras reais e atualize o envio pelo painel administrativo.
                        </p>
                        <Button asChild variant="outline" className="mt-4 w-full">
                          <Link href="/admin" onClick={() => setIsNotificationsOpen(false)}>
                            Abrir painel
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-stone-950">Atualizacoes de pedidos</p>
                        <p className="mt-1 text-sm text-stone-600">
                          Acompanhe o status atualizado das suas compras em Minha conta.
                        </p>
                        <Button asChild variant="outline" className="mt-4 w-full">
                          <Link href="/perfil" onClick={() => setIsNotificationsOpen(false)}>
                            Minha conta
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button asChild variant="ghost" size="icon" aria-label="Favoritos" className="relative">
            <Link href="/favoritos">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-950 px-1 text-[11px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" aria-label="Carrinho" className="relative">
            <Link href="/checkout">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-950 px-1 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Conta"
                onClick={() => {
                  setIsUserMenuOpen((current) => !current);
                  setIsNotificationsOpen(false);
                }}
              >
                <User className="h-5 w-5" />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-stone-950">{user.name || user.email}</p>
                    <p className="text-xs text-stone-500">{user.role === "admin" ? "Administrador" : "Cliente"}</p>
                  </div>
                  <Link
                    href="/perfil"
                    className="block px-4 py-3 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    Minha conta
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      Painel admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className="block w-full px-4 py-3 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
                    onClick={handleSignOut}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild variant="outline">
              <Link href="/entrar">Entrar</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 transition-colors hover:bg-stone-100 md:hidden"
          aria-label="Abrir menu"
          onClick={() => {
            setIsMobileMenuOpen((current) => !current);
            closeFloatingMenus();
          }}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/favoritos"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              <Heart className="h-5 w-5" />
              Favoritos
              {wishlistCount > 0 && (
                <span className="ml-auto rounded-full bg-stone-950 px-2 py-0.5 text-xs font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/checkout"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              <ShoppingCart className="h-5 w-5" />
              Carrinho
              {cartCount > 0 && (
                <span className="ml-auto rounded-full bg-stone-950 px-2 py-0.5 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Minha conta
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                  >
                    Painel admin
                  </Link>
                )}
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                  onClick={handleSignOut}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/entrar"
                className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
