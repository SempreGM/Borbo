import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Central de Ajuda</h1>
        <p className="text-muted-foreground mb-6">
          Aqui você encontra respostas para perguntas frequentes, suporte ao cliente e informações sobre pedidos.
        </p>
        <Button variant="outline" asChild>
          <Link href="/contact">Fale Conosco</Link>
        </Button>
      </div>
    </div>
  );
}
