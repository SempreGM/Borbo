"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function SignUpPage() {
  const { user, signUp, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!agreeToTerms) {
      setError("Você deve aceitar os termos para continuar.");
      return;
    }

    setIsSubmitting(true);
    const response = await signUp({
      email,
      name,
      phone,
      password,
      confirmPassword,
      agreeToTerms,
    });
    setIsSubmitting(false);

    if (!response.success) {
      setError(response.message ?? "Erro ao cadastrar. Tente novamente.");
      return;
    }

    if (response.message) {
      setSuccessMessage(response.message);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cadastrar</h1>
        <p className="text-muted-foreground mb-8">
          Crie sua conta para acompanhar pedidos, entregas e histórico de compras.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Nome
            </label>
            <Input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              Telefone opcional
            </label>
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Confirmar senha
              </label>
              <Input
                type="password"
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 rounded border border-border text-primary focus:ring-2 focus:ring-primary"
              />
              Aceito os termos e condições
            </label>
            <p className="text-sm text-muted-foreground">
              Ao criar sua conta, você concorda com a nossa política de privacidade e termos de uso.
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {successMessage ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
              {successMessage}{" "}
              <Link href="/entrar" className="font-semibold underline">
                Ir para login
              </Link>
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/entrar" className="text-primary hover:text-primary/90 font-medium">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
