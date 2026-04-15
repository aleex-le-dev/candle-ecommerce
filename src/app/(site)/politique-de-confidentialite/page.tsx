export const metadata = {
  title: 'Politique de Confidentialité - Lumière',
};

export default function PolitiqueConfidentialite() {
  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif mb-12 text-neutral-900 border-b pb-4">Politique de Confidentialité</h1>
      <div className="prose prose-neutral max-w-none">
        <h2 className="text-xl font-medium mt-8 mb-4">1. Collecte des données</h2>
        <p className="text-neutral-600 mb-4">
          Nous collectons les informations que vous nous fournissez lors de votre commande (nom, adresse, email) dans le seul but de traiter et d'expédier vos achats.
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">2. Utilisation des données</h2>
        <p className="text-neutral-600 mb-4">
          Vos données personnelles ne sont ni vendues, ni partagées à des tiers, à l'exception de nos partenaires logistiques chargés de l'expédition de votre commande.
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">3. Vos droits</h2>
        <p className="text-neutral-600 mb-4">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à contact@lumiere-bougies.fr.
        </p>
      </div>
    </div>
  );
}
