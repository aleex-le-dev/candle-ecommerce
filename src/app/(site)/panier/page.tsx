'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function Panier() {
  const { items, removeItem, count, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh]">
        <h1 className="text-4xl font-serif text-center mb-16 text-neutral-900">Votre Panier</h1>
        <div className="text-center py-20 bg-white border border-neutral-100 shadow-sm">
          <p className="text-neutral-500 mb-8 text-lg">Votre panier est actuellement vide.</p>
          <Link href="/boutique" className="inline-block border border-neutral-900 text-neutral-900 px-8 py-3 uppercase tracking-widest text-sm hover:bg-neutral-900 hover:text-white transition-colors duration-300">
            Continuer vos achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh]">
      <h1 className="text-4xl font-serif text-center mb-12 text-neutral-900">Votre Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Liste articles */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item._id} className="flex gap-4 bg-white border border-neutral-100 p-4">
              {item.image && (
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">{item.name}</h3>
                <p className="text-neutral-500 text-sm mt-1">{item.price.toFixed(2)} € × {item.qty}</p>
                <p className="text-neutral-900 text-sm font-medium mt-1">{(item.price * item.qty).toFixed(2)} €</p>
              </div>
              <button
                onClick={() => removeItem(item._id)}
                className="text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-100 p-6 sticky top-28">
            <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-700 mb-6">Récapitulatif</h2>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>{count} article{count > 1 ? 's' : ''}</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Livraison</span>
                <span>{total >= 50 ? 'Offerte' : '4,90 €'}</span>
              </div>
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-medium text-neutral-900">
                <span>Total</span>
                <span>{(total >= 50 ? total : total + 4.9).toFixed(2)} €</span>
              </div>
            </div>
            <Link href="/paiement" className="block text-center w-full bg-neutral-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors">
              Commander
            </Link>
            <Link href="/boutique" className="block text-center mt-4 text-xs text-neutral-400 hover:text-neutral-700 uppercase tracking-widest transition-colors">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
