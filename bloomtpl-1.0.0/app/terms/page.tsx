import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Termos e Condições</h1>
        <p className="text-muted-foreground mb-8">
          Estes termos definem as regras de uso do site Borbô e orientam sua experiência de compra.
        </p>

        <div className="space-y-6 text-sm text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Aceitação</h2>
            <p className="text-muted-foreground">
              Ao usar este site, você concorda com os termos descritos aqui e com nossa política de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Uso do site</h2>
            <p className="text-muted-foreground">
              Você concorda em utilizar o site para fins legais e não praticar atos que possam prejudicar o funcionamento ou a reputação da Borbô.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Compras e pagamentos</h2>
            <p className="text-muted-foreground">
              Os pedidos estão sujeitos à confirmação de estoque e às condições de pagamento apresentadas no momento da compra.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Entrega e devolução</h2>
            <p className="text-muted-foreground">
              Informações sobre prazos, frete e devolução são exibidas durante o processo de compra. Em caso de dúvidas, entre em contato com o atendimento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Alterações</h2>
            <p className="text-muted-foreground">
              A Borbô pode atualizar estes termos a qualquer momento. Mudanças serão válidas a partir da publicação no site.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/">Voltar para a home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
