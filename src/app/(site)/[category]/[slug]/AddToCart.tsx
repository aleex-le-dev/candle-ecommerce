'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

interface Props {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
}

export default function AddToCart({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(
      { _id: product._id, name: product.name, price: product.price, image: product.image },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-auto space-y-3">
      <div className="flex gap-3">
        {/* Quantité */}
        <div className="flex items-center border border-neutral-300 bg-white h-14 w-36">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-12 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors text-lg"
          >−</button>
          <span className="flex-1 text-center text-sm font-medium text-neutral-900">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
            className="w-12 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors text-lg"
          >+</button>
        </div>

        {/* Ajouter au panier */}
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`flex-1 h-14 text-sm uppercase tracking-widest font-medium transition-all duration-300 ${
            added
              ? 'bg-emerald-600 text-white'
              : product.stock === 0
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          {added ? '✓ Ajouté !' : product.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>

      <Link
        href="/panier"
        className="flex items-center justify-center w-full h-14 border border-neutral-300 text-sm uppercase tracking-widest font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        Voir le panier →
      </Link>
    </div>
  );
}
