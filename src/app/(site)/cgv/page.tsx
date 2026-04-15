export const metadata = {
  title: 'CGV - Lumière',
};

export default function CGV() {
  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif mb-12 text-neutral-900 border-b pb-4">Conditions Générales de Vente</h1>
      <div className="prose prose-neutral max-w-none">
        <h2 className="text-xl font-medium mt-8 mb-4">Article 1 - Objet</h2>
        <p className="text-neutral-600 mb-4">
          Les présentes conditions régissent les ventes par la société Lumière Bougies de bougies artisanales naturelles.
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">Article 2 - Prix</h2>
        <p className="text-neutral-600 mb-4">
          Les prix de nos produits sont indiqués en euros toutes taxes comprises (TVA et autres taxes applicables au jour de la commande), sauf indication contraire et hors frais de traitement et d'expédition.
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">Article 3 - Commandes</h2>
        <p className="text-neutral-600 mb-4">
          Vous pouvez passer commande sur notre site internet. La société se réserve le droit de ne pas enregistrer un paiement, et de ne pas confirmer une commande pour quelque raison que ce soit.
        </p>
        <h2 className="text-xl font-medium mt-8 mb-4">Article 4 - Rétractation</h2>
        <p className="text-neutral-600 mb-4">
          Conformément aux dispositions de l'article L.121-21 du Code de la Consommation, vous disposez d'un délai de rétractation de 14 jours à compter de la réception de vos produits pour exercer votre droit de rétraction.
        </p>
      </div>
    </div>
  );
}
