import { getAllArticles } from '@/lib/histoire-store';
import { getAllValeurs } from '@/lib/valeurs-store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notre Histoire - Lumière',
  description: "Découvrez l'histoire de Lumière, notre passion pour les bougies artisanales.",
};

export default async function NotreHistoire() {
  const articles = await getAllArticles();
  const valeurs = await getAllValeurs();

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

      {/* Articles */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {articles.map((article, i) => {
          const imageLeft = i % 2 === 0;
          return (
            <div key={article._id} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={`aspect-[4/3] bg-neutral-100 rounded-sm overflow-hidden ${imageLeft ? '' : 'order-1 md:order-2'}`}>
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.imageAlt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 text-6xl">📖</div>
                )}
              </div>
              <div className={imageLeft ? '' : 'order-2 md:order-1'}>
                <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">{article.theme}</p>
                <h2 className="text-2xl font-serif text-neutral-900 mb-5">{article.title}</h2>
                <p className="text-neutral-600 leading-relaxed text-sm">{article.body}</p>
              </div>
            </div>
          );
        })}

        {/* Nos valeurs */}
        {valeurs.length > 0 && (
          <div className="text-center border-t border-neutral-100 pt-20">
            <h2 className="text-2xl font-serif text-neutral-900 mb-12">Nos valeurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {valeurs.map(v => (
                <div key={v._id} className="flex flex-col items-center">
                  <span className="text-4xl mb-4">{v.icon}</span>
                  <h3 className="text-sm font-medium uppercase tracking-widest text-neutral-900 mb-3">{v.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
