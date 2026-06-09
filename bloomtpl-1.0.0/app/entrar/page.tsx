"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bootstrapMasterAccountAction } from "@/app/actions/bootstrap-master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const { user, signIn, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [bootstrapMessage, setBootstrapMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await signIn({ email, password, rememberMe });
    setIsSubmitting(false);

    if (!response.success) {
      setError(response.message ?? "Erro ao entrar. Tente novamente.");
      return;
    }

    router.push("/");
  };

  const handleBootstrapMaster = async () => {
    setBootstrapMessage("");
    setIsBootstrapping(true);

    const response = await bootstrapMasterAccountAction();

    setIsBootstrapping(false);
    setBootstrapMessage(response.message);

    if (response.success) {
      setEmail("bernardomaia57@gmail.com");
      setPassword("bernardo57");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-2">Entrar</h1>
        <p className="text-muted-foreground mb-8">
          Acesse sua conta para continuar comprando e acompanhar seus pedidos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              E-mail
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Senha
            </label>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border border-border text-primary focus:ring-2 focus:ring-primary"
              />
              Lembrar-me
            </label>
            <Link href="/" className="text-sm text-primary hover:text-primary/80">
              Esqueci minha senha
            </Link>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/cadastrar" className="text-primary hover:text-primary/90 font-medium">
            Criar uma conta
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-medium text-foreground">
            Acesso master de teste
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria ou atualiza a conta admin local quando o bootstrap estiver habilitado.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={handleBootstrapMaster}
            disabled={isBootstrapping}
          >
            {isBootstrapping ? "Criando conta..." : "Criar conta master de teste"}
          </Button>
          {bootstrapMessage ? (
            <p className="mt-3 text-sm text-muted-foreground">{bootstrapMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
