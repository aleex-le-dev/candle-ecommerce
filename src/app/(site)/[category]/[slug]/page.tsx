import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getAllProducts } from '@/lib/products-store';
import { productUrl } from '@/lib/slug';
import ProductGallery from './ProductGallery';
import AddToCart from './AddToCart';

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = getProductBySlug(category, slug);

  if (!product) notFound();

  const allProducts = getAllProducts();
  const related = allProducts.filter(p => p._id !== product._id).slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 pb-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/boutique" className="hover:text-neutral-900 transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-neutral-700">{product.name}</span>
        </nav>
      </div>

      {/* Section principale */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* Galerie */}
          <ProductGallery
            mainImage={product.image}
            gallery={product.gallery}
            name={product.name}
            category={product.category}
            featured={product.featured}
          />

          {/* Détails */}
          <div className="flex flex-col lg:pt-4">
            <div className="mb-6">
              <h1 className="text-4xl xl:text-5xl font-serif text-neutral-900 leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-neutral-900">{product.price.toFixed(2)} €</span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-xs text-amber-600 uppercase tracking-wider">Plus que {product.stock} en stock</span>
                )}
                {product.stock === 0 && (
                  <span className="text-xs text-red-500 uppercase tracking-wider">Rupture de stock</span>
                )}
              </div>
            </div>

            <div className="w-12 h-px bg-neutral-300 mb-6" />

            <p className="text-neutral-600 leading-relaxed text-base mb-8">
              {product.description}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: '🕯️', label: 'Combustion', value: product.burnTime || '—' },
                { icon: '⚖️', label: 'Poids net', value: product.weight || '—' },
                { icon: '🌿', label: 'Matières', value: 'Naturelles' },
                { icon: '🤲', label: 'Fabrication', value: 'Artisanale' },
              ].map(spec => (
                <div key={spec.label} className="bg-neutral-50 rounded-sm p-4 flex items-center gap-3">
                  <span className="text-xl">{spec.icon}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">{spec.label}</p>
                    <p className="text-sm font-medium text-neutral-800">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Composition */}
            {product.details && (
              <details className="mb-8 group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-neutral-700 uppercase tracking-wider py-3 border-y border-neutral-200 list-none">
                  Composition & Caractéristiques
                  <svg className="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="pt-4 text-sm text-neutral-600 leading-relaxed">{product.details}</p>
              </details>
            )}

            {/* Ajout panier */}
            <AddToCart product={product} />

            {/* Réassurance */}
            <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4">
              {[
                { icon: '🚚', text: 'Livraison offerte dès 50 €' },
                { icon: '♻️', text: 'Pot réutilisable' },
                { icon: '🌱', text: '100% naturel' },
              ].map(item => (
                <div key={item.text} className="text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <p className="text-[10px] text-neutral-500 leading-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Produits similaires */}
      {related.length > 0 && (
        <section className="py-16 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-serif text-neutral-900">Vous aimerez aussi</h2>
              <div className="w-12 h-px bg-neutral-300 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {related.map(p => (
                <Link key={p._id} href={productUrl(p.category, p.name)} className="group">
                  <div className="aspect-[4/5] bg-neutral-100 overflow-hidden mb-4 rounded-sm">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">{p.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.category}</p>
                    </div>
                    <span className="text-sm text-neutral-700">{p.price.toFixed(2)} €</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
