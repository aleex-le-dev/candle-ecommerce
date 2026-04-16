import Link from 'next/link';
import { getAllProducts } from '@/lib/products-store';
import BoutiqueClient from './BoutiqueClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Boutique - Lumière',
  description: 'Découvrez notre collection de bougies artisanales.',
};

export default async function Boutique() {
  const products = getAllProducts();

  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl lg:text-5xl font-serif text-neutral-900 mb-4">Notre Collection</h1>
        <p className="text-neutral-500 text-base max-w-xl mx-auto">
          Des bougies artisanales, formulées avec des matières naturelles et des parfums d&apos;exception.
        </p>
        <div className="w-12 h-px bg-neutral-300 mx-auto mt-6" />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🕯️</p>
          <p className="text-neutral-500">Aucun produit disponible pour le moment.</p>
          <p className="text-neutral-400 text-sm mt-2">
            <Link href="/admin" className="underline underline-offset-4 hover:text-neutral-900">Ajouter des produits via l&apos;admin</Link>
          </p>
        </div>
      ) : (
        <BoutiqueClient products={products} categories={categories} />
      )}
    </div>
  );
}
