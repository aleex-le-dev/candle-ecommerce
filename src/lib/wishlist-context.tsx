'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInWishlist: () => false,
  count: 0,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lumiere-wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('lumiere-wishlist', JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some(i => i._id === id);
  };

  const count = items.length;

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
