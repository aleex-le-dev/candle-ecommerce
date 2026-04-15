'use client';

import { useWishlist } from '@/lib/wishlist-context';
import { Heart } from 'lucide-react';

interface Props {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  className?: string;
}

export default function WishlistButton({ product, className = "" }: Props) {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  
  const active = isInWishlist(product._id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (active) {
      removeItem(product._id);
    } else {
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all duration-300 z-10 ${
        active 
          ? 'bg-white/90 text-red-500 shadow-sm' 
          : 'bg-white/40 text-neutral-600 hover:bg-white/80 hover:text-red-500 opacity-0 group-hover:opacity-100'
      } ${className}`}
      title={active ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
    >
      <Heart size={18} fill={active ? 'currentColor' : 'none'} strokeWidth={1.5} />
    </button>
  );
}
