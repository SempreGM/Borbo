"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAuth } from "@/context/AuthContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react";
import {
  fallbackCatalogProducts,
  getCatalogProducts,
  type CatalogProduct,
} from "@/lib/catalog";

export default function ProductList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    getCatalogProducts(15).then((catalogProducts) => {
      setProducts(catalogProducts);
      setIsMounted(true);
    });
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
    setIsModified(false);
  };

  const handleCancel = () => {
    setProducts(fallbackCatalogProducts.slice(0, 15));
    setIsModified(false);
  };

  const handleRemove = (productId: string | number) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setIsModified(true);
  };

  const moveProductStep = (fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;

    if (toIndex < 0 || toIndex >= products.length) {
      return;
    }

    setProducts((current) => {
      const items = Array.from(current);
      const [movedProduct] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedProduct);
      return items;
    });
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
          <Droppable droppableId="main-product-list" direction="horizontal">
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
                        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 rounded-full bg-white/90 p-1 shadow-md backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => moveProductStep(index, -1)}
                              disabled={index === 0}
                              className="rounded-full p-2 text-[#ec5c8d] transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Mover uma posição para trás"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div
                              {...provided.dragHandleProps}
                              className="rounded-full p-2 text-[#ec5c8d] cursor-grab transition-colors hover:bg-rose-50 active:cursor-grabbing"
                              title="Segure para arrastar"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <button
                              type="button"
                              onClick={() => moveProductStep(index, 1)}
                              disabled={index === products.length - 1}
                              className="rounded-full p-2 text-[#ec5c8d] transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Mover uma posição para frente"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(product.id)}
                            className="rounded-full bg-white/90 p-2 text-rose-500 shadow-md backdrop-blur-sm transition-colors hover:bg-rose-50"
                            title="Remover da vitrine"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
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
