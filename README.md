# Lumière — Boutique de bougies artisanales

Lumière est une boutique e-commerce complète dédiée aux bougies artisanales naturelles. Le projet couvre l'intégralité du parcours client — de la découverte des produits jusqu'au paiement — ainsi qu'une interface d'administration pour gérer le catalogue, les commandes et les promotions.

---

## Ce que fait le projet

### Côté client
- **Catalogue produits** avec filtres par catégorie, survol pour voir la 2e image, fiches produit détaillées
- **Panier** persistant (cookie), ajout/suppression/modification des quantités
- **Liste de souhaits** persistante
- **Paiement sécurisé** via Stripe Checkout (CB, Apple Pay, Google Pay) avec gestion des frais de livraison et codes promo
- **Espace compte** : informations personnelles, historique des commandes, téléchargement de facture PDF, préférences cookies
- **Authentification sans mot de passe** : magic link par email ou OAuth Google
- **Chatbot IA** intégré propulsé par Groq (Llama 3) avec contexte dynamique de la boutique (produits, prix, promos)
- **Bandeau RGPD** avec gestion des consentements cookies

### Côté admin (`/admin`)
- **Produits** : création, modification, suppression, gestion du stock
- **Catégories** : création, renommage, suppression
- **Codes promo** : pourcentage, montant fixe, livraison gratuite — avec date d'expiration et commande minimum
- **Commandes** : liste complète, changement de statut (en attente → confirmée → expédiée → livrée), remboursement direct via Stripe, renvoi de facture par email
- **Notre Histoire** et **Nos Valeurs** : gestion du contenu éditorial

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16.2 — App Router, Turbopack |
| Base de données | MongoDB Atlas via Mongoose |
| Authentification | Sessions HMAC-SHA256 custom (cookie HttpOnly) |
| Paiement | Stripe Checkout (hosted) |
| Email | Nodemailer + Gmail SMTP |
| IA chatbot | Groq API — `llama-3.1-8b-instant` |
| Styles | Tailwind CSS v4 |
| Icônes | Lucide React |

---

## Structure des routes

```
/                          Accueil
/boutique                  Catalogue (filtre par catégorie)
/[categorie]/[slug]        Fiche produit
/panier                    Panier
/paiement                  Checkout
/paiement/succes           Confirmation de commande
/wishlist                  Liste de souhaits
/notre-histoire            Articles de marque
/compte                    Espace client
/compte/connexion          Connexion (magic link / Google)
/facture/[id]              Facture imprimable / téléchargeable PDF
/cgu                       Conditions Générales d'Utilisation
/cgv                       Conditions Générales de Vente
/contact                   Contact
/admin                     Dashboard produits
/admin/categories          Gestion des catégories
/admin/promos              Codes promo
/admin/commandes           Gestion des commandes + remboursements
/admin/histoire            Articles "Notre Histoire"
/admin/valeurs             Valeurs de marque
```

---

## Fonctionnalités notables

- **Facture PDF** générée côté client via `window.print()` avec CSS print dédié — envoyée automatiquement par email à chaque commande confirmée, re-envoyable depuis l'admin
- **Remboursement Stripe** en un clic depuis l'admin, avec modal de confirmation — crédite automatiquement le moyen de paiement d'origine
- **Codes promo** de type "livraison gratuite" qui supprime la ligne livraison dans Stripe
- **Chatbot** avec contexte boutique injecté dynamiquement (catalogue, prix, best-sellers, promos actives)
- **Image au survol** dans la grille boutique : la 2e image du produit apparaît en fondu
- **Dropdown boutique** dans la navbar avec les catégories en temps réel
- **Commandes idempotentes** : la page de succès Stripe ne crée la commande qu'une seule fois même en cas de rechargement

---

## Variables d'environnement requises

```
MONGODB_URI
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
NEXT_PUBLIC_BASE_URL
STRIPE_SECRET_KEY
GROQ_API_KEY
```
