export const metadata = {
  title: 'CGU - Lumière',
};

export default function CGU() {
  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif mb-12 text-neutral-900 border-b pb-4">Conditions Générales d&apos;Utilisation</h1>
      <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600">

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 1 – Objet</h2>
          <p>
            Les présentes conditions générales d&apos;utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles Lumière Bougies met à disposition ses services sur le site lumiere-bougies.fr, ainsi que la manière dont l&apos;utilisateur accède au site et l&apos;utilise.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 2 – Accès au site</h2>
          <p>
            Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à Internet. Les frais liés à l&apos;accès au réseau Internet sont à la charge de l&apos;utilisateur. Le site peut être inaccessible temporairement en raison d&apos;opérations de maintenance ou de difficultés techniques.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 3 – Création de compte</h2>
          <p>
            Pour accéder à certains services (suivi de commandes, liste de souhaits, historique d&apos;achats), l&apos;utilisateur peut créer un compte personnel. L&apos;utilisateur est responsable de la confidentialité de ses informations de connexion et de toute activité effectuée via son compte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 4 – Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments présents sur le site (textes, photographies, logos, images, vidéos) est protégé par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable écrite de Lumière Bougies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 5 – Données personnelles</h2>
          <p>
            Les données personnelles collectées lors de la navigation ou de la création d&apos;un compte sont traitées conformément à notre{' '}
            <a href="/politique-de-confidentialite" className="underline underline-offset-4 hover:text-neutral-900 transition-colors">
              Politique de Confidentialité
            </a>
            . Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 6 – Cookies</h2>
          <p>
            Le site utilise des cookies afin d&apos;améliorer l&apos;expérience utilisateur et d&apos;analyser le trafic. Vous pouvez gérer vos préférences de cookies à tout moment depuis votre espace compte ou via le bandeau d&apos;information affiché lors de votre première visite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 7 – Responsabilité</h2>
          <p>
            Lumière Bougies ne saurait être tenue responsable des dommages directs ou indirects causés au matériel de l&apos;utilisateur lors de l&apos;accès au site. Des liens vers d&apos;autres sites peuvent être présents ; Lumière Bougies décline toute responsabilité quant à leur contenu.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 8 – Modification des CGU</h2>
          <p>
            Lumière Bougies se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. L&apos;utilisation continue du site après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-neutral-900 mb-3">Article 9 – Droit applicable</h2>
          <p>
            Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux français.
          </p>
        </section>

        <p className="text-sm text-neutral-400 pt-4 border-t border-neutral-100">
          Dernière mise à jour : avril 2026
        </p>
      </div>
    </div>
  );
}
