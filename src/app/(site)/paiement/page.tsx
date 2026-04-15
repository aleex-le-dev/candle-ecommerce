'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

interface PromoResult {
  valid: boolean;
  error?: string;
  discount: number;
  promo?: { code: string; type: string; value: number };
}

const SHIPPING = 4.9;

export default function Paiement() {
  const router = useRouter();
  const { items, total, count, removeItem } = useCart();

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', cp: '', ville: '', pays: 'France',
  });
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const shipping = total >= 50 ? 0 : SHIPPING;
  const discount = promo?.valid ? promo.discount : 0;
  const grandTotal = Math.max(0, total - discount + shipping);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`/api/promos/validate?code=${encodeURIComponent(promoInput)}&total=${total}`);
      const data: PromoResult = await res.json();
      if (data.valid) {
        setPromo(data);
        setPromoError('');
      } else {
        setPromo(null);
        setPromoError(data.error ?? 'Code invalide');
      }
    } catch {
      setPromoError('Erreur de connexion');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    // Simulation d'envoi commande
    await new Promise(r => setTimeout(r, 1200));
    setSuccess(true);
    items.forEach(i => removeItem(i._id));
    setSubmitting(false);
  };

  if (items.length === 0 && !success) {
    return (
      <div className="pt-24 pb-16 max-w-xl mx-auto px-4 text-center min-h-[60vh]">
        <p className="text-neutral-500 mb-6">Votre panier est vide.</p>
        <Link href="/boutique" className="inline-block border border-neutral-900 text-neutral-900 px-8 py-3 uppercase tracking-widest text-sm hover:bg-neutral-900 hover:text-white transition-colors">
          Voir la boutique
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="pt-24 pb-16 max-w-xl mx-auto px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif text-neutral-900 mb-4">Commande confirmée !</h1>
        <p className="text-neutral-500 mb-8 max-w-sm">
          Merci pour votre commande. Vous recevrez un email de confirmation dans quelques instants.
        </p>
        <Link href="/boutique" className="inline-block bg-neutral-900 text-white px-10 py-4 uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  const field = (id: keyof typeof form, label: string, type = 'text', required = true) => (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        required={required}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
      />
    </div>
  );

  return (
    <div className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-2 mb-10">
        <Link href="/" className="hover:text-neutral-900">Accueil</Link>
        <span>/</span>
        <Link href="/panier" className="hover:text-neutral-900">Panier</Link>
        <span>/</span>
        <span className="text-neutral-700">Paiement</span>
      </nav>

      <h1 className="text-3xl font-serif text-neutral-900 mb-10">Finaliser la commande</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Formulaire ── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Coordonnées */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5 pb-3 border-b border-neutral-100">
                Coordonnées
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {field('prenom', 'Prénom')}
                {field('nom', 'Nom')}
                <div className="col-span-2">{field('email', 'Email', 'email')}</div>
                <div className="col-span-2">{field('telephone', 'Téléphone', 'tel', false)}</div>
              </div>
            </section>

            {/* Livraison */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5 pb-3 border-b border-neutral-100">
                Adresse de livraison
              </h2>
              <div className="space-y-4">
                {field('adresse', 'Adresse')}
                <div className="grid grid-cols-2 gap-4">
                  {field('cp', 'Code postal')}
                  {field('ville', 'Ville')}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Pays *</label>
                  <select
                    value={form.pays}
                    onChange={e => setForm(f => ({ ...f, pays: e.target.value }))}
                    className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada'].map(p => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Paiement mock */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5 pb-3 border-b border-neutral-100">
                Paiement
              </h2>
              <div className="border border-neutral-200 p-5 rounded-sm bg-neutral-50 flex items-center gap-4">
                <div className="flex gap-2">
                  {['💳', '🏦'].map(icon => (
                    <div key={icon} className="w-12 h-8 border border-neutral-200 bg-white rounded flex items-center justify-center text-lg">
                      {icon}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-400">Paiement sécurisé — chiffrement SSL</p>
              </div>
            </section>
          </div>

          {/* ── Récapitulatif ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-100 p-6 sticky top-28">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5">Votre commande</h2>

              {/* Articles */}
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    {item.image && (
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-800 truncate">{item.name}</p>
                      <p className="text-xs text-neutral-400">× {item.qty}</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-800 flex-shrink-0">
                      {(item.price * item.qty).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Code promo */}
              <div className="mb-5">
                <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Code promo</label>
                {promo?.valid ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-sm">
                    <span className="text-xs text-emerald-700 font-medium">
                      {promoInput.toUpperCase()} — {promo.promo?.type === 'percent' ? `−${promo.promo.value}%` : `−${promo.discount.toFixed(2)} €`}
                    </span>
                    <button type="button" onClick={removePromo} className="text-emerald-400 hover:text-emerald-700 text-xs ml-2">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                      placeholder="PROMO20"
                      className="flex-1 border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {promoLoading ? '…' : 'Appliquer'}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
              </div>

              {/* Totaux */}
              <div className="space-y-2 text-sm border-t border-neutral-100 pt-4 mb-6">
                <div className="flex justify-between text-neutral-600">
                  <span>Sous-total ({count} art.)</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Réduction</span>
                    <span>−{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between font-semibold text-neutral-900 text-base border-t border-neutral-100 pt-3 mt-2">
                  <span>Total</span>
                  <span>{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-neutral-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {submitting ? 'Traitement…' : 'Passer la commande'}
              </button>

              <p className="text-center text-xs text-neutral-400 mt-4">
                🔒 Paiement 100% sécurisé
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
