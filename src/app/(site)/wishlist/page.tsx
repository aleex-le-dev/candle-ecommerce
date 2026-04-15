'use client';

import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { Trash2, ShoppingBag } from 'lucide-react';
import { productUrl } from '@/lib/slug';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: any) => {
    addItem({ _id: item._id, name: item.name, price: item.price, image: item.image }, 1);
    removeItem(item._id);
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      <h1 className="text-3xl font-serif text-neutral-900 mb-8 border-b border-neutral-200 pb-4">Ma Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🤍</div>
          <h2 className="text-xl font-medium text-neutral-900 mb-4">Votre wishlist est vide</h2>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">Vous n\'avez pas encore ajouté de produits à votre wishlist. Découvrez notre collection de bougies artisanales.</p>
          <Link
            href="/boutique"
            className="inline-block bg-neutral-900 text-white px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors"
          >
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item._id} className="group flex flex-col bg-white border border-neutral-100 p-4 rounded-sm shadow-sm hover:shadow-md transition-shadow">
              <Link href={productUrl(item.category, item.name)} className="block aspect-[4/5] bg-neutral-50 overflow-hidden relative mb-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeItem(item._id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur text-red-500 hover:text-red-600 rounded-full hover:bg-white transition-colors"
                  title="Retirer de la wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </Link>
              <div className="flex-grow">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">{item.category}</p>
                <h3 className="text-sm font-medium text-neutral-900 truncate uppercase tracking-wide mb-1">{item.name}</h3>
                <p className="text-sm text-neutral-700 mb-4">{item.price.toFixed(2)} €</p>
              </div>
              <button
                onClick={() => handleMoveToCart(item)}
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-neutral-900 text-white text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                <ShoppingBag size={14} />
                Ajouter au panier
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
