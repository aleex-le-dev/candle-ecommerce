export const metadata = {
  title: 'Mentions Légales - Lumière',
};

export default function MentionsLegales() {
  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif mb-12 text-neutral-900 border-b pb-4">Mentions Légales</h1>
      <div className="prose prose-neutral max-w-none">
        <h2 className="text-xl font-medium mt-8 mb-4">1. Éditeur du site</h2>
        <p className="text-neutral-600 mb-4">
          Nom de l'entreprise : Lumière Bougies<br/>
          Siège social : [Votre Adresse]<br/>
          Email : contact@lumiere-bougies.fr<br/>
          RCS : [Votre Numéro RCS]
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">2. Hébergement</h2>
        <p className="text-neutral-600 mb-4">
          Le site est hébergé par Vercel Inc.<br/>
          340 S Lemon Ave #4133 Walnut, CA 91789
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">3. Propriété Intellectuelle</h2>
        <p className="text-neutral-600 mb-4">
          L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.
        </p>
      </div>
    </div>
  );
}
