import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Trocas e devoluções
        </h1>
        <p className="text-muted-foreground mb-4">
          Você pode solicitar devolução em até 7 dias após o recebimento do
          pedido, conforme as condições de atendimento da loja.
        </p>
        <p className="text-muted-foreground mb-6">
          Para trocas, fale com o atendimento informando o número do pedido,
          produto e motivo da solicitação.
        </p>
        <Button variant="outline" asChild>
          <Link href="/contact">Fale conosco para suporte</Link>
        </Button>
      </div>
    </div>
  );
}
