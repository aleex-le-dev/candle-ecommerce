export const metadata = {
  title: 'Notre Histoire - Lumière',
  description: 'Découvrez l\'histoire de Lumière, notre passion pour les bougies artisanales.',
};

export default function NotreHistoire() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <h1 className="text-4xl lg:text-5xl font-serif text-neutral-900 mb-6">Notre Histoire</h1>
        <div className="w-12 h-px bg-neutral-300 mx-auto mb-8" />
        <p className="text-neutral-500 text-base leading-relaxed">
          Née d&apos;une passion pour les matières naturelles et les parfums d&apos;exception, Lumière est bien plus qu&apos;une marque de bougies — c&apos;est un art de vivre.
        </p>
      </div>

      {/* Story sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] bg-neutral-100 rounded-sm overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1616858004746-860e68e43827?q=80&w=1200"
              alt="Atelier Lumière"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">Les Origines</p>
            <h2 className="text-2xl font-serif text-neutral-900 mb-5">Un atelier provençal, une passion</h2>
            <p className="text-neutral-600 leading-relaxed text-sm mb-4">
              Tout a commencé dans un petit atelier en Provence, où notre fondatrice a appris l&apos;art de la bougie auprès d&apos;artisans locaux. Fascinée par la transformation de la cire et des huiles essentielles en objets de beauté, elle a voulu partager cette magie avec le plus grand nombre.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm">
              Chaque bougie Lumière est coulée à la main, en petites séries, pour garantir une qualité irréprochable et un soin particulier porté à chaque détail.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">Notre Philosophie</p>
            <h2 className="text-2xl font-serif text-neutral-900 mb-5">Le naturel avant tout</h2>
            <p className="text-neutral-600 leading-relaxed text-sm mb-4">
              Nous utilisons exclusivement des cires végétales — soja, coco, colza — et des parfums développés par des nez de Grasse. Aucun composé chimique nocif, aucun paraben, aucune paraffine.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm">
              Nos mèches en coton brûlent doucement et proprement, libérant les senteurs sans noircir vos murs ni polluer votre intérieur.
            </p>
          </div>
          <div className="aspect-[4/3] bg-neutral-100 rounded-sm overflow-hidden order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1582239459521-8ff819c9e54a?q=80&w=1200"
              alt="Ingrédients naturels"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div className="text-center border-t border-neutral-100 pt-20">
          <h2 className="text-2xl font-serif text-neutral-900 mb-12">Nos valeurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { icon: '🌿', title: 'Naturel', desc: 'Matières premières sélectionnées pour leur origine naturelle et leur qualité.' },
              { icon: '🤲', title: 'Artisanal', desc: 'Chaque bougie est coulée et assemblée à la main dans notre atelier.' },
              { icon: '♻️', title: 'Durable', desc: 'Pots en verre réutilisables, emballages recyclés, impact minimal.' },
            ].map(v => (
              <div key={v.title} className="flex flex-col items-center">
                <span className="text-4xl mb-4">{v.icon}</span>
                <h3 className="text-sm font-medium uppercase tracking-widest text-neutral-900 mb-3">{v.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
