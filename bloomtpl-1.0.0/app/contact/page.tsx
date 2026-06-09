"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  Headphones,
  Instagram,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Shield,
} from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Instagram,
      title: "Instagram",
      details: ["@seja.borbo"],
      description: "Acompanhe novidades, bastidores e lançamentos",
    },
    {
      icon: Mail,
      title: "E-mail",
      details: ["oi@borbo.com.br", "atendimento@borbo.com.br"],
      description: "Envie sua mensagem a qualquer momento",
    },
    {
      icon: Phone,
      title: "Telefone",
      details: ["(11) 4000-1234"],
      description: "Segunda a sexta, das 9h às 18h",
    },
    {
      icon: Clock,
      title: "Atendimento",
      details: ["Online para todo o Brasil"],
      description: "Resposta em até 2 horas úteis",
    },
  ];

  const features = [
    {
      icon: Headphones,
      title: "Atendimento dedicado",
      description: "Atendimento humanizado sempre que precisar",
    },
    {
      icon: MessageSquare,
      title: "Resposta rápida",
      description: "Cuidamos da sua solicitação com proximidade",
    },
    {
      icon: Shield,
      title: "Segurança e privacidade",
      description: "Seus dados são tratados com cuidado",
    },
  ];

  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Fale com a gente
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Estamos prontos para
              <span className="text-primary block lg:inline lg:ml-4">
                te ouvir
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tem dúvida sobre produto, entrega, troca ou atendimento? Nosso
              time está aqui para ajudar.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Envie uma mensagem
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Preencha o formulário abaixo e retornaremos o contato o mais
                    breve possível.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                          Seu nome
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Nome completo"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-background border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          Seu e-mail
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-background border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Assunto
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="Como podemos ajudar você?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Sua mensagem
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Conte-nos mais sobre sua dúvida ou solicitação..."
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="bg-background border-border resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || isSubmitted}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </div>
                      ) : isSubmitted ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Mensagem enviada!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Enviar mensagem
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Canais de atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.title} className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {info.title}
                        </h3>
                        {info.details.map((detail) => (
                          <p key={detail} className="text-sm text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Por que falar conosco?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={feature.title}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-accent/10 rounded">
                          <feature.icon className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      {index < features.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-6">
              Perguntas
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre respostas rápidas para dúvidas comuns sobre nossos
              produtos e serviços.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Quais são as políticas de envio?",
                answer:
                  "As condições de frete e prazo são exibidas na página de Frete e confirmadas no checkout.",
              },
              {
                question: "Como posso rastrear meu pedido?",
                answer:
                  "Assim que seu pedido for enviado, você receberá um código de rastreamento por e-mail.",
              },
              {
                question: "Qual é a política de trocas e devoluções?",
                answer:
                  "Solicitações de devolução podem ser feitas em até 7 dias após o recebimento do pedido.",
              },
              {
                question: "Qual é o principal canal de novidades?",
                answer:
                  "O Instagram oficial @seja.borbo reúne lançamentos, bastidores e inspirações de looks.",
              },
            ].map((faq) => (
              <Card key={faq.question} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
