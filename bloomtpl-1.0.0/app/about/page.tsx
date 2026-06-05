import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Quem somos</h1>
        <p className="text-muted-foreground mb-6">
          Borbô é uma marca de moda feminina dedicada a criar peças elegantes e acessíveis.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Voltar para a home</Link>
        </Button>
      </div>
    </div>
  );
}
