import ProductList from "@/components/home/ProductList";
import { FeaturedCollection } from "@/components/common/FeaturedCollection";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 py-8 sm:py-12 lg:py-16 lg:px-8">
        <div className="text-center mx-auto mb-18 space-y-3">
          <h1 className="text-primary leading-tighter text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Entre no estilo Borbô
          </h1>
          <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg">
            Descubra nossa nova coleção feminina com peças elegantes, leves e
            versáteis para todas as ocasiões.
          </p>
        </div>
      </div>

      <FeaturedCollection
        title="Coleção Essência"
        description="Peças que celebram a leveza e a elegância feminina em cada detalhe."
        imageUrl="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
        href="/shop"
      />

      <div className="px-4 py-16 lg:px-8">
        <ProductList />
      </div>
    </div>
  );
}
