import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string | number;
  image: string;
  name: string;
  price: number;
  category?: string;
}

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string | number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWishlist: (product) => {
        const { items } = get();
        const isItemInWishlist = items.some((item) => item.id === product.id);

        if (isItemInWishlist) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'borbo-wishlist-storage', // nome da chave no localStorage
    }
  )
);
