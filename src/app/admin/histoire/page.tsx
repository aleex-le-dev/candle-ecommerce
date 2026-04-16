'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Article {
  _id: string;
  theme: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  order: number;
}

const EMPTY_FORM = {
  theme: '',
  title: '',
  body: '',
  image: '',
  imageAlt: '',
  order: '',
};

export default function AdminHistoire() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/histoire');
      setArticles(await res.json());
    } catch {
      showToast('Impossible de charger les articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const openCreate = () => {
    const nextOrder = articles.length > 0 ? Math.max(...articles.map(a => a.order)) + 1 : 0;
    setForm({ ...EMPTY_FORM, order: String(nextOrder) });
    setEditId(null);
    setPanel('create');
  };

  const openEdit = (a: Article) => {
    setForm({
      theme: a.theme,
      title: a.title,
      body: a.body,
      image: a.image,
      imageAlt: a.imageAlt,
      order: String(a.order),
    });
    setEditId(a._id);
    setPanel('edit');
  };

  const handleSave = async () => {
    if (!form.theme || !form.title || !form.body) {
      showToast('Thème, titre et texte sont requis', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, body: form.body, order: Number(form.order) || 0 };
      const url = panel === 'edit' ? `/api/histoire/${editId}` : '/api/histoire';
      const method = panel === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      showToast(panel === 'edit' ? 'Article mis à jour ✓' : 'Article créé ✓');
      setPanel('list');
      fetchArticles();
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/histoire/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Article supprimé');
      setDeleteConfirm(null);
      fetchArticles();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--adm-bg)] font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md
          ${toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--adm-card)] border border-[var(--adm-border-input)] rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-center text-[var(--adm-text)] font-semibold text-lg mb-2">Supprimer cet article ?</h3>
            <p className="text-center text-[var(--adm-text-40)] text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-[var(--adm-border-input)] text-[var(--adm-text-60)] text-sm hover:bg-[var(--adm-surface)] transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[var(--adm-border)] flex flex-col bg-[var(--adm-sidebar)] flex-shrink-0">
          <div className="p-6 border-b border-[var(--adm-border)]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-black font-bold text-sm">L</span>
              </div>
              <div>
                <p className="text-[var(--adm-text)] font-semibold text-sm">Lumière</p>
                <p className="text-[var(--adm-text-30)] text-xs">Administration</p>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-1">Catalogue</p>
            <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Produits
            </Link>

            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-4">Marketing</p>
            <Link href="/admin/promos" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Codes promo
            </Link>

            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-4">Contenu</p>
            <Link href="/admin/valeurs" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Nos Valeurs
            </Link>
            <button
              onClick={() => setPanel('list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${panel === 'list' ? 'bg-[var(--adm-surface-lg)] text-[var(--adm-text)]' : 'text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)]'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Notre Histoire
              <span className="ml-auto text-xs bg-[var(--adm-surface-lg)] px-2 py-0.5 rounded-full">{articles.length}</span>
            </button>
            <button
              onClick={openCreate}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${panel === 'create' ? 'bg-[var(--adm-surface-lg)] text-[var(--adm-text)]' : 'text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)]'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel article
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {panel === 'list' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-[var(--adm-text)]">Notre Histoire</h1>
                  <p className="text-[var(--adm-text-30)] text-sm mt-1">Gérez les articles de la page Notre Histoire</p>
                </div>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--adm-cta-bg)] text-[var(--adm-cta-text)] text-sm font-medium rounded-xl hover:bg-[var(--adm-cta-hover)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvel article
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-[var(--adm-spinner-ring)] border-t-[var(--adm-spinner-top)] rounded-full animate-spin" />
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">📖</div>
                  <p className="text-[var(--adm-text-30)] text-sm">Aucun article. Créez le premier !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article._id} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-5 flex items-center gap-5 group">
                      {/* Image preview */}
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-[var(--adm-surface)] flex-shrink-0">
                        {article.image ? (
                          <img src={article.image} alt={article.imageAlt} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-30)] mb-1">{article.theme}</p>
                        <p className="text-[var(--adm-text)] text-sm font-medium truncate">{article.title}</p>
                        <p className="text-[var(--adm-text-30)] text-xs mt-1 line-clamp-1">{article.body}</p>
                      </div>

                      {/* Order badge */}
                      <span className="text-xs text-[var(--adm-text-40)] bg-[var(--adm-surface)] px-3 py-1 rounded-full flex-shrink-0">
                        #{article.order + 1}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => openEdit(article)}
                          className="p-2 rounded-lg hover:bg-[var(--adm-surface-lg)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(article._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--adm-text-40)] hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(panel === 'create' || panel === 'edit') && (
            <div className="p-8 max-w-2xl">
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setPanel('list')} className="p-2 rounded-xl hover:bg-[var(--adm-surface)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-[var(--adm-text)]">
                    {panel === 'create' ? 'Nouvel article' : 'Modifier l\'article'}
                  </h1>
                  <p className="text-[var(--adm-text-30)] text-sm mt-1">
                    Les articles s&apos;affichent en alternant image gauche / droite selon leur ordre.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Thème *</label>
                    <input
                      type="text"
                      value={form.theme}
                      onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
                      placeholder="Ex : Les Origines"
                      className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Ordre d&apos;affichage</label>
                    <input
                      type="number"
                      min="0"
                      value={form.order}
                      onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Titre *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex : Un atelier provençal, une passion"
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Texte *</label>
                  <textarea
                    rows={6}
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="Rédigez le contenu de cet article..."
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Image (URL)</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm"
                  />
                  {form.image && (
                    <div className="mt-3 w-40 h-28 rounded-xl overflow-hidden border border-[var(--adm-border-input)]">
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Texte alternatif de l&apos;image</label>
                  <input
                    type="text"
                    value={form.imageAlt}
                    onChange={e => setForm(f => ({ ...f, imageAlt: e.target.value }))}
                    placeholder="Ex : Atelier Lumière en Provence"
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--adm-border)]">
                  <button onClick={() => setPanel('list')} className="px-5 py-2.5 rounded-xl text-[var(--adm-text-40)] text-sm hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[var(--adm-cta-bg)] text-[var(--adm-cta-text)] text-sm font-medium hover:bg-[var(--adm-cta-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-[var(--adm-cta-spinner-ring)] border-t-[var(--adm-cta-spinner-top)] rounded-full animate-spin" />}
                    {panel === 'create' ? 'Créer l\'article' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
