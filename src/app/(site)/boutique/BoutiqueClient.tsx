'use client';

import { useState } from 'react';
import Link from 'next/link';
import { productUrl } from '@/lib/slug';
import WishlistButton from '@/components/WishlistButton';
import type { Product } from '@/lib/products-store';

interface Props {
  products: Product[];
  categories: string[];
}

export default function BoutiqueClient({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('Tous');

  const filtered =
    activeCategory === 'Tous'
      ? products
      : products.filter(p => p.category === activeCategory);

  return (
    <>
      {/* Category pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest border rounded-full transition-colors ${
              activeCategory === cat
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🕯️</p>
          <p className="text-neutral-500">Aucun produit dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14">
          {filtered.map((product) => (
            <Link href={productUrl(product.category, product.name)} key={product._id} className="group block">
              <div className="aspect-[4/5] bg-neutral-100 mb-4 overflow-hidden relative rounded-sm">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🕯️</div>
                )}
                <WishlistButton product={product} />
                {product.featured && (
                  <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-neutral-900 text-white px-2.5 py-1">
                    Bestseller
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="text-xs uppercase tracking-widest text-neutral-600">Épuisé</span>
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-medium text-neutral-900 uppercase tracking-wide leading-tight">{product.name}</h2>
                  <p className="text-[11px] text-neutral-400 mt-0.5 uppercase tracking-wide">{product.category}</p>
                  {(() => {
                    const stock = Number(product.stock ?? 0);
                    return stock <= 0
                      ? <p className="text-[11px] text-red-500 mt-1 uppercase tracking-widest font-medium">Rupture de stock</p>
                      : <p className="text-[11px] text-emerald-600 mt-1 tracking-wide">{stock} en stock</p>;
                  })()}
                </div>
                <span className="text-sm text-neutral-700 font-light ml-2 flex-shrink-0">{product.price.toFixed(2)} €</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
