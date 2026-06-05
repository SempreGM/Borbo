import ProductList from "@/components/home/ProductList";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import HeroBanner from "@/components/home/HeroBanner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <HeroBanner />

      <FeaturedCollection
        name="Coleção Metamorfose"
        description="Looks leves para mulheres em constante transformação."
      />

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Catálogo borbô
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Peças para combinar com o seu momento
            </h2>
          </div>
          <Button asChild variant="ghost" className="w-fit text-primary">
            <Link href="/shop">Ver todos os produtos</Link>
          </Button>
        </div>
        <ProductList />
      </section>
    </div>
  );
}
