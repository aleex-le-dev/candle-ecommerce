<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Lumière — Documentation projet

Boutique e-commerce de bougies artisanales. Next.js 16 App Router + MongoDB Atlas + Mongoose.

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| Base de données | MongoDB Atlas via Mongoose (`src/lib/mongodb.ts`) |
| Auth | Sessions HMAC-SHA256 custom (cookie HttpOnly `lumiere-session`) |
| Email | Nodemailer + Gmail SMTP |
| IA chatbot | Groq API (`llama-3.1-8b-instant`) |
| Styles | Tailwind CSS v4 |
| Icônes | Lucide React |

## Variables d'environnement (.env.local)

```
MONGODB_URI=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GROQ_API_KEY=gsk_...
```

## Architecture des routes

### Site (`src/app/(site)/`)
- `/` — Page d'accueil
- `/boutique` — Catalogue avec filtre catégories (`?cat=Nom`)
- `/[category]/[slug]` — Fiche produit (URL générée via `src/lib/slug.ts`)
- `/notre-histoire` — Articles de marque
- `/panier` — Panier
- `/paiement` — Checkout
- `/wishlist` — Liste de souhaits
- `/compte` — Espace client (commandes, infos, cookies)
- `/compte/connexion` — Auth unifiée (email → magic link ou inscription)
- `/compte/verify` — Page d'attente vérification email
- `/contact`, `/cgv`, `/mentions-legales`, `/politique-de-confidentialite`

### Admin (`src/app/admin/`)
- `/admin` — Produits (CRUD complet)
- `/admin/categories` — Gestion des catégories
- `/admin/promos` — Codes promo
- `/admin/histoire` — Articles "Notre Histoire"
- `/admin/valeurs` — Valeurs de marque

**Sidebar admin** : composant partagé `src/components/AdminSidebar.tsx`. Ne pas dupliquer — toutes les pages admin l'importent. Il fetch ses propres counts via `/api/admin/counts`.

### API (`src/app/api/`)
- `/api/products` — CRUD produits
- `/api/categories` — CRUD catégories (sync automatique depuis les produits existants au GET)
- `/api/promos` + `/api/promos/validate` — Codes promo
- `/api/histoire`, `/api/valeurs` — Contenu éditorial
- `/api/orders` — Commandes
- `/api/admin/counts` — Compteurs sidebar admin (products, promos, histoire, valeurs, categories)
- `/api/auth/login` — Envoi magic link (pas de mot de passe)
- `/api/auth/magic` — Validation magic link → session
- `/api/auth/register` — Création compte + email de vérification
- `/api/auth/verify` — Validation token email
- `/api/auth/resend-verification` — Renvoyer l'email de vérification
- `/api/auth/me` — GET profil / PUT mise à jour profil
- `/api/auth/logout` — Supprime la session
- `/api/auth/google` — Initie OAuth Google
- `/api/auth/google/callback` — Callback OAuth Google
- `/api/chat` — Chatbot Groq (contexte boutique injecté dynamiquement depuis la DB)

## Authentification

**Passwordless** — pas de mot de passe sur le site.

Flux connexion :
1. L'utilisateur saisit son email sur `/compte/connexion`
2. Si email inconnu → saisie prénom/nom → création compte → email de vérification
3. Si email connu + vérifié → magic link envoyé (15 min)
4. Si email connu + non vérifié → email de vérification renvoyé

OAuth Google : même flux, vérification email obligatoire même pour Google.

Sessions : token HMAC stocké en cookie HttpOnly `lumiere-session`. `src/lib/auth.ts` gère `createSession` / `verifySession`.

## Modèles Mongoose (`src/lib/models/`)

- `User` — name, email, googleId, emailVerified, verifyToken, loginToken, loginTokenExp, telephone, adresse, cp, ville, pays
- `Product` — name, category, price, description, details, variables[], image, gallery[], stock, featured
- `Category` — name (unique)
- `Promo` — code, type (percent|fixed), value, minOrder, active, expiresAt
- `Article` — theme, title, body, image, imageAlt, order
- `Valeur` — icon, title, desc, order
- `Order` — orderNumber, userId, items[], total, status, createdAt
- `Counter` — pour l'auto-incrément des numéros de commande

## Composants clés (`src/components/`)

- `Navbar.tsx` — Server Component async, fetch les catégories pour le dropdown boutique
- `BoutiqueDropdown.tsx` — Dropdown hover catégories dans la navbar (client)
- `AdminSidebar.tsx` — Sidebar admin partagée, fetch ses propres counts
- `ChatWidget.tsx` — Chatbot flottant (Groq), rendu markdown maison (listes, gras, liens, images)
- `CookieBanner.tsx` — Bandeau RGPD (localStorage `lumiere-cookie-consent`)
- `AccountIcon.tsx` — Icône compte navbar (lien direct, pas de dropdown)
- `CartIcon.tsx`, `WishlistIcon.tsx` — Icônes panier/wishlist

## Contextes (`src/lib/`)

- `auth-context.tsx` — `useAuth()` → `{ user }` (userId, name, email)
- `cart-context.tsx` — `useCart()` → panier, persisté en cookie `lumiere-cart`
- `wishlist-context.tsx` — `useWishlist()` → liste de souhaits, persisté en cookie `lumiere-wishlist`
- `cookies-consent.ts` — `getConsent()`, `saveConsent()`, `acceptAll()`, `refuseAll()` (localStorage)

## Slugs et URLs produits

```ts
// src/lib/slug.ts
slugify(str)           // "Fleur de Lavande" → "fleur-de-lavande"
productUrl(cat, name)  // "/florale/fleur-de-lavande"
```

## Chatbot (`/api/chat`)

- Modèle : `llama-3.1-8b-instant` via Groq
- Le system prompt est généré dynamiquement depuis la DB (produits, catégories, promos actives)
- Rendu markdown côté client dans `ChatWidget.tsx` : listes ol/ul, **gras**, [liens](url), ![images](url)
- Ferme au clic en dehors (click outside handler sur `widgetRef`)

## Thème admin

CSS custom properties dans `src/app/globals.css`, activées via `data-admin-theme="dark|light"` sur le div racine (`AdminShell.tsx`). Ne pas utiliser de classes Tailwind classiques dans l'admin — toujours utiliser `var(--adm-*)`.

## Pièges connus

- **`dbConnect()`** retourne la connexion Mongoose, pas `{ db }`. Pour le driver natif : `mongoose.connection.db!`
- **`useSearchParams()`** requiert un `<Suspense>` parent dans l'App Router
- **Modèle User** : utilise `delete (mongoose.models as any).User` pour éviter les conflits de cache en dev lors des changements de schéma
- **Catégories** : le GET `/api/categories` sync automatiquement les catégories issues des produits existants vers la collection `categories`
- **Sidebar admin** : ne jamais copier la sidebar dans une nouvelle page, toujours importer `AdminSidebar`
- **`next/image`** : vérifier la config `remotePatterns` dans `next.config.ts` avant d'ajouter des images externes
