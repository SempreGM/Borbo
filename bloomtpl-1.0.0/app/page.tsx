import ProductList from "@/components/home/ProductList";
import FeaturedCollection from "@/components/home/FeaturedCollection";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="px-4 py-12 sm:py-16 lg:py-20 lg:px-8">
        <div className="text-center mx-auto space-y-3">
          <h1 className="text-primary leading-tighter text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Entre no estilo Borbô
          </h1>
          <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg">
            Descubra nossa nova coleção feminina com peças elegantes, leves e
            versáteis para todas as ocasiões.
          </p>
        </div>
      </div>

      {/* Seção de Coleção em Destaque */}
      <FeaturedCollection 
        name="Coleção Metamorfose" 
        description="A leveza da seda encontra o design contemporâneo."
      />

      {/* Listagem Geral */}
      <div className="px-4 py-16 lg:px-8">
        <h3 className="max-w-7xl mx-auto text-xl font-medium mb-8 text-muted-foreground uppercase tracking-widest">Confira tudo</h3>
        <ProductList />
      </div>
    </div>
  );
}
