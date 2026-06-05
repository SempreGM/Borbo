"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAuth } from "@/context/AuthContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, X } from "lucide-react";
import {
  fallbackCatalogProducts,
  getFeaturedCatalogProducts,
  type CatalogProduct,
} from "@/lib/catalog";

interface FeaturedCollectionProps {
  name: string;
  description?: string;
}

export default function FeaturedCollection({ name, description }: FeaturedCollectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    getFeaturedCatalogProducts(3).then((featuredProducts) => {
      setProducts(featuredProducts);
      setIsMounted(true);
    });
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts(items);
    setIsModified(true);
  };

  const handleSave = () => {
    console.log("borbô Admin - Salvando destaque no banco:", products.map((product) => product.id));
    setIsModified(false);
  };

  const handleCancel = () => {
    setProducts(fallbackCatalogProducts.slice(0, 3));
    setIsModified(false);
  };

  const handleRemove = (productId: string | number) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setIsModified(true);
  };

  if (!isMounted) return null;

  return (
    <section id="colecao" className="py-12 border-y border-[#ffc4a6]/30 bg-[#ffc4a6]/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="text-center lg:text-left">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
              Destaque da semana
            </p>
            <h2 className="text-3xl font-bold tracking-normal text-[#ec5c8d] sm:text-4xl">
              {name}
            </h2>
            {description && (
              <p className="mt-2 text-muted-foreground text-lg">{description}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex flex-col items-end gap-2">
              {!isModified ? (
                <div className="bg-[#ec5c8d]/10 text-[#ec5c8d] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#ec5c8d]/20">
                  Modo Admin: reorganize a vitrine
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-[#ec5c8d] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#ec5c8d]/90 shadow-sm transition-all"
                  >
                    Salvar ordem
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-white text-muted-foreground border border-border px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isAdmin ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="featured-list" direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {products.map((product, index) => (
                    <Draggable key={product.id} draggableId={String(product.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative transition-all ${snapshot.isDragging ? "z-50 scale-105" : ""}`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="absolute top-4 left-4 z-30 p-2 bg-white/90 rounded-full shadow-md cursor-grab active:cursor-grabbing hover:bg-white transition-colors"
                            title="Segure para mover"
                          >
                            <GripVertical className="h-4 w-4 text-[#ec5c8d]" />
                          </div>
                          <button
                            onClick={() => handleRemove(product.id)}
                            className="absolute top-4 right-4 z-30 p-2 bg-white/90 rounded-full shadow-md hover:bg-rose-50 text-rose-500 transition-colors"
                            title="Remover da coleção"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className={snapshot.isDragging ? "opacity-50" : ""}>
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
