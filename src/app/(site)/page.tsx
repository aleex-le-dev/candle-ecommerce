import Link from 'next/link';
import { getAllProducts } from '@/lib/products-store';
import { productUrl } from '@/lib/slug';
import WishlistButton from '@/components/WishlistButton';

export const dynamic = 'force-dynamic';

export default function Home() {
  const allProducts = getAllProducts();
  const featured = allProducts.filter(p => p.featured).slice(0, 3);
  const displayProducts = featured.length > 0 ? featured : allProducts.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Premium Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0">
          <img 
            src="/hero.png" 
            alt="Lumière" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <span className="inline-block text-white/70 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-6 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
            Nouveautés
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-white mb-8 tracking-tight font-light drop-shadow-lg">
            L'Élégance <br className="hidden sm:block"/> <span className="italic font-light">Infinie.</span>
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            Éclairez chaque instant avec notre collection de bougies parfumées, où la cire artisanale rencontre la haute parfumerie de Grasse.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/boutique" 
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-black hover:bg-neutral-200 transition-all duration-500 text-xs uppercase tracking-[0.2em] font-medium shadow-2xl"
            >
              Découvrir
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-neutral-900 mb-4">Nos Bestsellers</h2>
          <div className="w-16 h-px bg-neutral-300 mx-auto" />
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🕯️</p>
            <p className="text-neutral-500">Aucun produit disponible pour le moment.</p>
            <Link href="/admin" className="inline-block mt-4 text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-900 transition-colors">
              Ajouter des produits via l&apos;administration
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayProducts.map((product) => (
              <Link key={product._id} href={productUrl(product.category, product.name)} className="group cursor-pointer block">
                <div className="aspect-[4/5] bg-neutral-100 mb-6 relative overflow-hidden rounded-sm">
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
                </div>
                <h3 className="text-lg font-medium text-neutral-900 uppercase tracking-wide">{product.name}</h3>
                <p className="text-neutral-400 text-sm mt-0.5 uppercase tracking-wide">{product.category}</p>
                <p className="text-neutral-700 font-light mt-2">{product.price.toFixed(2)} €</p>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Link href="/boutique" className="inline-block border border-neutral-300 text-neutral-700 px-10 py-4 uppercase tracking-widest text-sm hover:border-neutral-900 hover:text-neutral-900 transition-colors duration-300">
            Voir toute la collection →
          </Link>
        </div>
      </section>
    </div>
  );
}
