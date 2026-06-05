"use client";

import { useEffect, useState } from "react";
import productsData from "@/data/products.json";
import ProductCard from "./ProductCard";
import { useAuth } from "@/context/AuthContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, X } from "lucide-react";

interface Product {
  id: number;
  image: string;
  name: string;
  price: number;
  category?: string;
}

export default function ProductList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setProducts(productsData.slice(0, 15));
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !isAdmin) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts(items);
    setIsModified(true);
  };

  const handleSave = () => {
    console.log("Borbô Admin - Salvando listagem geral:", products.map((product) => product.id));
    setIsModified(false);
  };

  const handleCancel = () => {
    setProducts(productsData.slice(0, 15));
    setIsModified(false);
  };

  const handleRemove = (productId: number) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setIsModified(true);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {isAdmin && (
        <div className={`flex gap-2 mb-8 transition-all duration-300 ${isModified ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
          <button
            onClick={handleSave}
            className="bg-[#ec5c8d] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-[#ec5c8d]/90"
          >
            Salvar ordem geral
          </button>
          <button
            onClick={handleCancel}
            className="bg-white text-muted-foreground border border-border px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-50"
          >
            Descartar alterações
          </button>
        </div>
      )}

      {isAdmin ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="main-product-list" direction="vertical">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {products.map((product, index) => (
                  <Draggable key={product.id} draggableId={`main-${product.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative ${snapshot.isDragging ? "z-50" : ""}`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-4 left-4 z-30 p-2 bg-white/90 rounded-full shadow-md cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4 text-[#ec5c8d]" />
                        </div>
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="absolute top-4 right-4 z-30 p-2 bg-white/90 rounded-full shadow-md hover:bg-rose-50 text-rose-500 transition-colors"
                          title="Remover da vitrine"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className={snapshot.isDragging ? "scale-105 transition-transform" : ""}>
                          <ProductCard product={product} isAdmin={isAdmin} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <h3 className="text-xl font-semibold">Nenhum produto disponível</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
