import { Card, CardContent } from "@/components/ui/card";
import { Headphones, RotateCcw, Truck } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Truck, title: "Frete grátis", desc: "Em pedidos acima de R$250" },
    { icon: RotateCcw, title: "Devolução fácil", desc: "Até 7 dias após o recebimento" },
    { icon: Headphones, title: "Atendimento humano", desc: "Suporte próximo para ajudar na sua compra" },
  ];

  return (
    <Card className="mb-16">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h2>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
