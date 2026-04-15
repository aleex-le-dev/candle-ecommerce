import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-serif tracking-widest mb-4">LUMIÈRE</h3>
            <p className="text-sm leading-relaxed text-neutral-400">
              Des bougies artisanales coulées à la main avec passion. Illuminez votre intérieur avec nos senteurs uniques et naturelles.
            </p>
          </div>
          <div>
            <h4 className="text-white tracking-widest uppercase text-sm mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/boutique" className="hover:text-white transition-colors">Boutique</Link></li>
              <li><Link href="/panier" className="hover:text-white transition-colors">Panier</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white tracking-widest uppercase text-sm mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link></li>
              <li><Link href="/cgv" className="hover:text-white transition-colors">C.G.V.</Link></li>
              <li><Link href="/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Lumière. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
