import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const font = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "borbô | Moda feminina elegante e acessível",
  description:
    "borbô é um e-commerce de moda feminina elegante e acessível. Encontre looks modernos, leves e versáteis para vestir sua melhor versão.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${font.className} font-sans antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
