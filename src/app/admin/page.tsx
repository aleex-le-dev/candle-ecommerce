'use client';

import { useState, useEffect, useRef } from 'react';
import { productUrl } from '@/lib/slug';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  details: string;
  burnTime: string;
  weight: string;
  image: string;
  gallery: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  name: '',
  category: 'Florale',
  price: '',
  description: '',
  details: '',
  burnTime: '',
  weight: '',
  image: '',
  gallery: ['', '', ''],
  stock: '',
  featured: false,
};

const CATEGORIES = ['Florale', 'Gourmande', 'Boisée', 'Orientale', 'Fraîche', 'Épicée'];

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'stock'>('info');
  const formRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      showToast('Impossible de charger les produits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setActiveTab('info');
    setPanel('create');
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      description: p.description,
      details: p.details,
      burnTime: p.burnTime,
      weight: p.weight,
      image: p.image,
      gallery: [...p.gallery, '', '', ''].slice(0, 3),
      stock: String(p.stock),
      featured: p.featured,
    });
    setEditId(p._id);
    setActiveTab('info');
    setPanel('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      showToast('Le nom et le prix sont requis', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        gallery: form.gallery.filter(Boolean),
      };
      const url = panel === 'edit' ? `/api/products/${editId}` : '/api/products';
      const method = panel === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      showToast(panel === 'edit' ? 'Produit mis à jour ✓' : 'Produit créé ✓');
      setPanel('list');
      fetchProducts();
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Produit supprimé');
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const featured = products.filter(p => p.featured).length;
  const totalStock = products.reduce((a, p) => a + p.stock, 0);

  return (
    <div className="min-h-screen bg-[#080808] font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md transition-all
          ${toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-center text-white font-semibold text-lg mb-2">Supprimer ce produit ?</h3>
            <p className="text-center text-white/40 text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0d0d0d] flex-shrink-0">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-black font-bold text-sm">L</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Lumière</p>
                <p className="text-white/30 text-xs">Administration</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Gestion */}
            <p className="text-[10px] uppercase tracking-widest text-white/20 px-4 pb-2 pt-1">Catalogue</p>
            <button
              onClick={() => setPanel('list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                panel === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Tous les produits
              <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">{products.length}</span>
            </button>

            <button
              onClick={openCreate}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                panel === 'create' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau produit
            </button>

            {/* Fiches produits */}
            {products.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-widest text-white/20 px-4 pb-2 pt-4">Fiches produits</p>
                {products.map(p => (
                  <a
                    key={p._id}
                    href={productUrl(p.category, p.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        : <span className="text-[8px] flex items-center justify-center w-full h-full">🕯️</span>
                      }
                    </div>
                    <span className="truncate flex-1">{p.name}</span>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-shrink-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </>
            )}

            {/* Pages du site */}
            <p className="text-[10px] uppercase tracking-widest text-white/20 px-4 pb-2 pt-4">Pages du site</p>
            {[
              { href: '/', label: 'Accueil', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { href: '/boutique', label: 'Boutique', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
              { href: '/panier', label: 'Panier', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
              { href: '/cgv', label: 'CGV', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { href: '/mentions-legales', label: 'Mentions légales', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { href: '/politique-de-confidentialite', label: 'Confidentialité', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            ].map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all group"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
                <span className="truncate flex-1">{label}</span>
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-shrink-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {panel === 'list' && (
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-white">Catalogue</h1>
                  <p className="text-white/30 text-sm mt-1">Gérez votre collection de bougies</p>
                </div>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau produit
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Produits', value: products.length, icon: '📦' },
                  { label: 'En vedette', value: featured, icon: '⭐' },
                  { label: 'Stock total', value: totalStock + ' unités', icon: '🏷️' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#161616] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/30 text-sm">{stat.label}</span>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">🕯️</div>
                  <p className="text-white/30 text-sm">Aucun produit. Créez votre premier produit !</p>
                </div>
              ) : (
                <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-6 py-4">Produit</th>
                        <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-4 py-4">Catégorie</th>
                        <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-4 py-4">Prix</th>
                        <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-4 py-4">Stock</th>
                        <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-4 py-4">Statut</th>
                        <th className="px-4 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((product) => (
                        <tr key={product._id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">🕯️</div>
                                )}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{product.name}</p>
                                <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full">{product.category}</span>
                          </td>
                          <td className="px-4 py-4 text-white text-sm font-medium">{product.price.toFixed(2)} €</td>
                          <td className="px-4 py-4">
                            <span className={`text-sm font-medium ${product.stock > 5 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {product.featured ? (
                              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">Vedette</span>
                            ) : (
                              <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">Standard</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(product)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <a
                                href={productUrl(product.category, product.name)}
                                target="_blank"
                                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              <button
                                onClick={() => setDeleteConfirm(product._id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(panel === 'create' || panel === 'edit') && (
            <div className="p-8 max-w-3xl">
              {/* Form header */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setPanel('list')}
                  className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {panel === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
                  </h1>
                  <p className="text-white/30 text-sm mt-1">
                    {panel === 'create' ? 'Remplissez les informations du produit' : 'Mettez à jour les informations'}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit">
                {([['info', 'Informations'], ['images', 'Images'], ['stock', 'Stock & Options']] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div ref={formRef} className="space-y-5">
                {/* TAB: INFO */}
                {activeTab === 'info' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Nom du produit *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Ex : Fleur de Lavande"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Catégorie</label>
                        <select
                          value={form.category}
                          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Prix (€) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                          placeholder="24.00"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Description courte</label>
                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description affichée sur la fiche produit..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Composition & Détails</label>
                      <textarea
                        rows={4}
                        value={form.details}
                        onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                        placeholder="Cire, mèche, parfum, temps de combustion..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Durée de combustion</label>
                        <input
                          type="text"
                          value={form.burnTime}
                          onChange={e => setForm(f => ({ ...f, burnTime: e.target.value }))}
                          placeholder="Ex : 45h"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Poids net</label>
                        <input
                          type="text"
                          value={form.weight}
                          onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                          placeholder="Ex : 180g"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* TAB: IMAGES */}
                {activeTab === 'images' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Image principale (URL)</label>
                      <input
                        type="url"
                        value={form.image}
                        onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                      />
                      {form.image && (
                        <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                          <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Photos de galerie (URL)</label>
                      <div className="space-y-3">
                        {form.gallery.map((url, i) => (
                          <div key={i} className="flex gap-3">
                            <input
                              type="url"
                              value={url}
                              onChange={e => {
                                const g = [...form.gallery];
                                g[i] = e.target.value;
                                setForm(f => ({ ...f, gallery: g }));
                              }}
                              placeholder={`Photo galerie ${i + 1}`}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                            />
                            {url && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                <img src={url} alt={`Galerie ${i+1}`} className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-white/20 text-xs mt-2">Conseil : utilisez des liens Unsplash (images.unsplash.com)</p>
                    </div>
                  </>
                )}

                {/* TAB: STOCK & OPTIONS */}
                {activeTab === 'stock' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Quantité en stock</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Options</label>
                      <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-colors">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-amber-500' : 'bg-white/10'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Produit en vedette</p>
                          <p className="text-white/30 text-xs">Affiché sur la page d'accueil parmi les bestsellers</p>
                        </div>
                      </label>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-8">
                  <button
                    onClick={() => setPanel('list')}
                    className="px-5 py-2.5 rounded-xl text-white/40 text-sm hover:text-white hover:bg-white/5 transition-all"
                  >
                    Annuler
                  </button>
                  <div className="flex gap-3">
                    {activeTab !== 'stock' && (
                      <button
                        onClick={() => setActiveTab(activeTab === 'info' ? 'images' : 'stock')}
                        className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-all"
                      >
                        Suivant →
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                      {panel === 'create' ? 'Créer le produit' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
