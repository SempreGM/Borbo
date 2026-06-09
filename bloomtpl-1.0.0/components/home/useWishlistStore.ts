import {
  addFavorite,
  clearFavorites,
  listFavorites,
  removeFavorite,
} from "@/services/favorites";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistProduct {
  id: string | number;
  image: string;
  name: string;
  price: number;
  category?: string;
}

interface WishlistState {
  items: WishlistProduct[];
  isSyncing: boolean;
  error: string | null;
  syncWithUser: (userId?: string | null) => Promise<void>;
  toggleWishlist: (
    product: WishlistProduct,
    userId?: string | null
  ) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  clearWishlist: (userId?: string | null) => Promise<void>;
}

function canUseRemoteFavorite(productId: string | number): productId is string {
  return typeof productId === "string" && productId.length >= 30;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      error: null,

      syncWithUser: async (userId) => {
        if (!userId) {
          return;
        }

        set({ isSyncing: true, error: null });

        try {
          const favorites = await listFavorites(userId);
          set({ items: favorites, isSyncing: false });
        } catch {
          set({
            isSyncing: false,
            error: "Nao foi possivel carregar seus favoritos agora.",
          });
        }
      },

      toggleWishlist: async (product, userId) => {
        const { items } = get();
        const isItemInWishlist = items.some((item) => item.id === product.id);
        const nextItems = isItemInWishlist
          ? items.filter((item) => item.id !== product.id)
          : [...items, product];

        set({ items: nextItems, error: null });

        if (!userId || !canUseRemoteFavorite(product.id)) {
          return;
        }

        try {
          if (isItemInWishlist) {
            await removeFavorite(userId, product.id);
          } else {
            await addFavorite(userId, product.id);
          }
        } catch {
          set({
            items,
            error: "Nao foi possivel atualizar seus favoritos agora.",
          });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: async (userId) => {
        const previousItems = get().items;
        set({ items: [], error: null });

        if (!userId) {
          return;
        }

        try {
          await clearFavorites(userId);
        } catch {
          set({
            items: previousItems,
            error: "Nao foi possivel limpar seus favoritos agora.",
          });
        }
      },
    }),
    {
      name: "borbo-wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
