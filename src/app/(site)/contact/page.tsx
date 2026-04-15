export const metadata = {
  title: 'Contact - Lumière',
  description: 'Contactez l\'équipe Lumière pour toute question sur nos bougies artisanales.',
};

export default function Contact() {
  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-serif text-neutral-900 mb-4">Contactez-nous</h1>
        <div className="w-12 h-px bg-neutral-300 mx-auto mb-6" />
        <p className="text-neutral-500 text-sm">
          Une question, une demande spéciale ou simplement l&apos;envie de nous dire bonjour ? Nous vous répondons sous 48h.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Contact info */}
        <div className="space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">Email</p>
            <p className="text-neutral-800 text-sm">contact@lumiere-bougies.fr</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">Atelier</p>
            <p className="text-neutral-800 text-sm leading-relaxed">
              12 rue des Artisans<br />
              13100 Aix-en-Provence<br />
              France
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">Horaires</p>
            <p className="text-neutral-800 text-sm leading-relaxed">
              Lundi – Vendredi : 9h – 18h<br />
              Samedi : 10h – 16h
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Nom</label>
            <input
              type="text"
              className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Email</label>
            <input
              type="email"
              className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Message</label>
            <textarea
              rows={5}
              className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white resize-none"
              placeholder="Votre message..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
