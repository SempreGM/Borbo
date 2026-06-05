import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Loja</h1>
        <p className="text-muted-foreground mb-6">
          Encontre todos os produtos disponíveis no catálogo Borbô.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Em breve, aqui você poderá filtrar por novidades, promoções e destaques.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Voltar para a home</Link>
        </Button>
      </div>
    </div>
  );
}
