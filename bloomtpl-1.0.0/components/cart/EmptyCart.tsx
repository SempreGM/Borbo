import { Button } from "@/components/ui/button";
import { Shield, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-220px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Seu carrinho está vazio
          </h1>
          <p className="mx-auto max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            Parece que você ainda não adicionou nada ao carrinho.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-5">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/">Continuar comprando</Link>
          </Button>

          <div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Frete informado no checkout
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Checkout seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
