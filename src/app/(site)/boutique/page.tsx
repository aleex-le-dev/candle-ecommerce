import Link from 'next/link';
import { getAllProducts } from '@/lib/products-store';
import { productUrl } from '@/lib/slug';

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
          Des bougies artisanales, formulées avec des matières naturelles et des parfums d'exception.
        </p>
        <div className="w-12 h-px bg-neutral-300 mx-auto mt-6" />
      </div>

      {/* Category pills (static display, filtering côté client non requis ici) */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {categories.map(cat => (
          <span
            key={cat}
            className="px-4 py-1.5 text-xs uppercase tracking-widest border border-neutral-200 text-neutral-500 rounded-full cursor-default hover:border-neutral-900 hover:text-neutral-900 transition-colors"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🕯️</p>
          <p className="text-neutral-500">Aucun produit disponible pour le moment.</p>
          <p className="text-neutral-400 text-sm mt-2">
            <Link href="/admin" className="underline underline-offset-4 hover:text-neutral-900">Ajouter des produits via l&apos;admin</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14">
          {products.map((product) => (
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
                </div>
                <span className="text-sm text-neutral-700 font-light ml-2 flex-shrink-0">{product.price.toFixed(2)} €</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
