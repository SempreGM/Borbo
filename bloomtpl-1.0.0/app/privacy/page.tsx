import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-4">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">
          Na Borbô, valorizamos sua privacidade e estamos comprometidos a proteger seus dados pessoais.
        </p>

        <div className="space-y-6 text-sm text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Dados que coletamos</h2>
            <p className="text-muted-foreground">
              Coletamos informações como nome, e-mail, endereço de entrega, telefone e histórico de compras para oferecer uma experiência mais personalizada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Uso das informações</h2>
            <p className="text-muted-foreground">
              Utilizamos seus dados para processar pedidos, enviar atualizações sobre compras, melhorar o atendimento e mostrar ofertas relevantes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Segurança</h2>
            <p className="text-muted-foreground">
              Protegemos suas informações com medidas de segurança técnicas e administrativas para reduzir riscos de acesso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Compartilhamento</h2>
            <p className="text-muted-foreground">
              Não vendemos seus dados. Compartilhamos informações apenas com serviços essenciais para entrega e pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Seus direitos</h2>
            <p className="text-muted-foreground">
              Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato pelo e-mail {"oi@borbo.com.br"}.
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
