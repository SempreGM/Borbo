import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const orders = [
  {
    id: "#B-1024",
    date: "12/05/2026",
    total: 349.9,
    status: "Entregue",
    items: 3,
    products: [
      { name: "Vestido Seda Borbô", quantity: 1, price: 169.9 },
      { name: "Blusa Vintage", quantity: 1, price: 89.0 },
      { name: "Acessório Luxo", quantity: 1, price: 91.0 },
    ],
  },
  {
    id: "#B-1018",
    date: "28/04/2026",
    total: 189.0,
    status: "Em transporte",
    items: 2,
    products: [
      { name: "Macacão Preto", quantity: 1, price: 129.0 },
      { name: "Cinto Couro", quantity: 1, price: 60.0 },
    ],
  },
  {
    id: "#B-1007",
    date: "14/03/2026",
    total: 429.5,
    status: "Entregue",
    items: 4,
    products: [
      { name: "Casaco Elegante", quantity: 1, price: 239.5 },
      { name: "Calça Alfaiataria", quantity: 1, price: 120.0 },
      { name: "Meia-Fina", quantity: 2, price: 35.0 },
    ],
  },
];

interface OrderPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetailsPage({ params }: OrderPageProps) {
  const orderId = decodeURIComponent(params.orderId);
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-2">Detalhes do pedido</h1>
        <p className="text-muted-foreground mb-8">Informações do pedido {order?.id}</p>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">Pedido</h2>
            <p className="text-foreground">{order?.id}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <p className="text-foreground">{order?.status}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">Data</h2>
            <p className="text-foreground">{order?.date}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold mb-2">Total</h2>
            <p className="font-semibold text-foreground">{formatCurrency(order?.total)}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Itens do pedido</h2>
          <div className="space-y-4">
            {order?.products.map((product) => (
              <div key={product.name} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
                <div>
                  <p className="font-semibold text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">Quantidade: {product.quantity}</p>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row justify-end">
          <Button variant="outline" asChild>
            <Link href="/perfil">Voltar à minha conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
