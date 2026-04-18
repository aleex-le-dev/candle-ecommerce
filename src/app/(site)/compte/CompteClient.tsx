'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getConsent, saveConsent, type CookieConsent } from '@/lib/cookies-consent';
const formatOrderNumber = (n: number) => String(n).padStart(7, '0');

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  confirmed: { label: 'Confirmée',   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  shipped:   { label: 'Expédiée',    color: 'text-blue-600 bg-blue-50 border-blue-200' },
  delivered: { label: 'Livrée',      color: 'text-neutral-700 bg-neutral-100 border-neutral-200' },
  cancelled: { label: 'Annulée',     color: 'text-red-500 bg-red-50 border-red-200' },
};

interface Order {
  _id: string;
  orderNumber: number;
  createdAt: string;
  status: string;
  total: number;
  items: { name: string; qty: number; price: number; image?: string }[];
}

interface UserInfo {
  userId: string;
  name: string;
  email: string;
  telephone: string;
  adresse: string;
  cp: string;
  ville: string;
  pays: string;
}

type Tab = 'commandes' | 'infos' | 'cookies';

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'infos',     label: 'Mes infos',     icon: '👤' },
  { id: 'commandes', label: 'Mes commandes', icon: '📦' },
  { id: 'cookies',   label: 'Cookies',       icon: '🍪' },
];

export default function CompteClient({ user, orders }: { user: UserInfo; orders: Order[] }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get('tab') === 'commandes' ? 'commandes' : 'infos'
  );
  const nameParts = user.name.split(' ');
  const [form, setForm] = useState({
    prenom:    nameParts[0] ?? '',
    nom:       nameParts.slice(1).join(' '),
    email:     user.email,
    telephone: user.telephone,
    adresse:   user.adresse,
    cp:        user.cp,
    ville:     user.ville,
    pays:      user.pays,
  });
  const [sidebarName, setSidebarName] = useState(user.name);
  const [sidebarEmail, setSidebarEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [cookiePrefs, setCookiePrefs] = useState<CookieConsent>(() => getConsent() ?? { essential: true, analytics: false, marketing: false });
  const [cookieSaved, setCookieSaved] = useState(false);

  const handleSaveCookies = () => {
    saveConsent(cookiePrefs);
    setCookieSaved(true);
    setTimeout(() => setCookieSaved(false), 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const fullName = [form.prenom, form.nom].filter(Boolean).join(' ');
      if (fullName) setSidebarName(fullName);
      if (form.email) setSidebarEmail(form.email);
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const field = (id: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <input
        type={type}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
      />
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-neutral-50 flex justify-center">
      <div className="w-full max-w-5xl flex min-h-[calc(100vh-5rem)]">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
        {/* Profil */}
        <div className="px-6 py-8 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-white font-medium text-lg mb-3">
            {sidebarName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-neutral-900 truncate">{sidebarName}</p>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{sidebarEmail}</p>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 px-3 mb-3">Mon compte</p>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm mb-1 transition-colors ${
                tab === item.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === 'commandes' && orders.length > 0 && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${tab === item.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                  {orders.length}
                </span>
              )}
            </button>
          ))}
          <div className="border-t border-neutral-100 mt-3 pt-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Contenu ── */}
      <main className="flex-1 px-8 py-10 overflow-y-auto">

        {/* ── Mes commandes ── */}
        {tab === 'commandes' && (
          <>
            <h1 className="text-2xl font-serif text-neutral-900 mb-8">Mes commandes</h1>

            {orders.length === 0 ? (
              <div className="text-center py-24 border border-neutral-100 rounded-sm bg-white">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-neutral-500 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
                <Link
                  href="/boutique"
                  className="inline-block bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  Découvrir la boutique
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const s = STATUS_LABEL[order.status] ?? STATUS_LABEL.confirmed;
                  const date = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '';
                  return (
                    <div key={order._id} className="border border-neutral-100 bg-white p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-1">Commande</p>
                          <p className="text-xs font-mono text-neutral-600">#{formatOrderNumber(order.orderNumber)}</p>
                          {date && <p className="text-xs text-neutral-400 mt-0.5">{date}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[11px] uppercase tracking-widest px-3 py-1 border rounded-full ${s.color}`}>
                            {s.label}
                          </span>
                          <span className="text-sm font-medium text-neutral-900">{order.total.toFixed(2)} €</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.image && (
                              <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-50">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-800 truncate">{item.name}</p>
                              <p className="text-xs text-neutral-400">× {item.qty} · {item.price.toFixed(2)} €</p>
                            </div>
                            <span className="text-xs text-neutral-600 flex-shrink-0">
                              {(item.price * item.qty).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Mes infos ── */}
        {tab === 'infos' && (
          <>
            <h1 className="text-2xl font-serif text-neutral-900 mb-8">Mes informations</h1>

            <div className="bg-white border border-neutral-100 p-8 max-w-xl">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field('prenom', 'Prénom')}
                  {field('nom', 'Nom')}
                </div>
                {field('email', 'Email', 'email')}
                <div className="border-t border-neutral-100 pt-4">
                  {field('telephone', 'Téléphone', 'tel')}
                {field('adresse', 'Adresse')}
                <div className="grid grid-cols-2 gap-4">
                  {field('cp', 'Code postal')}
                  {field('ville', 'Ville')}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Pays</label>
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

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {saving ? 'Sauvegarde…' : 'Enregistrer'}
                  </button>
                  {saved && <p className="text-emerald-600 text-sm">✓ Sauvegardé</p>}
                </div>
              </form>
            </div>
          </>
        )}
        {/* ── Cookies ── */}
        {tab === 'cookies' && (
          <>
            <h1 className="text-2xl font-serif text-neutral-900 mb-8">Préférences cookies</h1>
            <div className="bg-white border border-neutral-100 p-8 max-w-xl">
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                Gérez vos préférences de cookies. Les cookies essentiels sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
              </p>
              <div className="space-y-0 mb-8">
                {([
                  { key: 'essential' as keyof CookieConsent, label: 'Essentiels', desc: 'Authentification, panier, session. Nécessaires au fonctionnement du site.', locked: true },
                  { key: 'analytics' as keyof CookieConsent, label: 'Analytiques', desc: 'Mesure d\'audience et statistiques de navigation anonymisées.', locked: false },
                  { key: 'marketing' as keyof CookieConsent, label: 'Marketing', desc: 'Personnalisation des publicités et suivi des conversions.', locked: false },
                ]).map(({ key, label, desc, locked }) => (
                  <div key={key} className="flex items-center gap-6 py-5 border-b border-neutral-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 mb-1">{label}</p>
                      <p className="text-xs text-neutral-400 leading-relaxed">{desc}</p>
                    </div>
                    {locked ? (
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-200 px-2 py-1 whitespace-nowrap">
                        Toujours actif
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCookiePrefs(p => ({ ...p, [key]: !p[key] }))}
                        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${cookiePrefs[key] ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                      >
                        <span className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${cookiePrefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveCookies}
                  className="bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  Enregistrer
                </button>
                {cookieSaved && <p className="text-emerald-600 text-sm">✓ Sauvegardé</p>}
              </div>
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  );
}
