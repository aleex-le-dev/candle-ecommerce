'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Valeur {
  _id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
}

const EMPTY_FORM = { icon: '', title: '', desc: '', order: '' };

export default function AdminValeurs() {
  const [valeurs, setValeurs] = useState<Valeur[]>([]);
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

  const fetchValeurs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/valeurs');
      setValeurs(await res.json());
    } catch {
      showToast('Impossible de charger les valeurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    fetchValeurs().then(() => { if (searchParams.get('new') === '1') openCreate(); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    const nextOrder = valeurs.length > 0 ? Math.max(...valeurs.map(v => v.order)) + 1 : 0;
    setForm({ ...EMPTY_FORM, order: String(nextOrder) });
    setEditId(null);
    setPanel('create');
  };

  const openEdit = (v: Valeur) => {
    setForm({ icon: v.icon, title: v.title, desc: v.desc, order: String(v.order) });
    setEditId(v._id);
    setPanel('edit');
  };

  const handleSave = async () => {
    if (!form.title || !form.desc) {
      showToast('Titre et description sont requis', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      const url = panel === 'edit' ? `/api/valeurs/${editId}` : '/api/valeurs';
      const method = panel === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      showToast(panel === 'edit' ? 'Valeur mise à jour ✓' : 'Valeur créée ✓');
      setPanel('list');
      fetchValeurs();
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/valeurs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Valeur supprimée');
      setDeleteConfirm(null);
      fetchValeurs();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const SidebarLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link href={href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${active ? 'bg-[var(--adm-surface-lg)] text-[var(--adm-text)]' : 'text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)]'}`}>
      {icon}
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[var(--adm-bg)] font-sans">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md
          ${toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--adm-card)] border border-[var(--adm-border-input)] rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-center text-[var(--adm-text)] font-semibold text-lg mb-2">Supprimer cette valeur ?</h3>
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
            <div className="flex items-center gap-1">
              <Link href="/admin" className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Produits
              </Link>
              <Link href="/admin?new=1" title="Nouveau produit" className="p-2 rounded-xl text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all text-lg leading-none">+</Link>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-4">Marketing</p>
            <div className="flex items-center gap-1">
              <Link href="/admin/promos" className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Codes promo
              </Link>
              <Link href="/admin/promos?new=1" title="Nouveau code" className="p-2 rounded-xl text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all text-lg leading-none">+</Link>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-4">Contenu</p>
            <div className="flex items-center gap-1">
              <Link href="/admin/histoire" className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Notre Histoire
              </Link>
              <Link href="/admin/histoire?new=1" title="Nouvel article" className="p-2 rounded-xl text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all text-lg leading-none">+</Link>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPanel('list')} className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${panel === 'list' ? 'bg-[var(--adm-surface-lg)] text-[var(--adm-text)]' : 'text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)]'}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Nos Valeurs
                <span className="ml-auto text-xs bg-[var(--adm-surface-lg)] px-2 py-0.5 rounded-full">{valeurs.length}</span>
              </button>
              <button onClick={openCreate} title="Nouvelle valeur" className="p-2 rounded-xl text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all text-lg leading-none">+</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {panel === 'list' && (
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[var(--adm-text)]">Nos Valeurs</h1>
                <p className="text-[var(--adm-text-30)] text-sm mt-1">Gérez les valeurs affichées sur la page Notre Histoire</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-[var(--adm-spinner-ring)] border-t-[var(--adm-spinner-top)] rounded-full animate-spin" />
                </div>
              ) : valeurs.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">💎</div>
                  <p className="text-[var(--adm-text-30)] text-sm">Aucune valeur. Créez la première !</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {valeurs.map((v) => (
                    <div key={v._id} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-6 group relative">
                      <div className="text-4xl mb-4">{v.icon || '💎'}</div>
                      <p className="text-[var(--adm-text)] text-sm font-medium uppercase tracking-wide mb-2">{v.title}</p>
                      <p className="text-[var(--adm-text-30)] text-xs leading-relaxed">{v.desc}</p>
                      <span className="absolute top-4 right-4 text-xs text-[var(--adm-text-40)] bg-[var(--adm-surface)] px-2 py-0.5 rounded-full">#{v.order + 1}</span>
                      <div className="flex gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(v)}
                          className="flex-1 py-2 rounded-lg text-xs border border-[var(--adm-border-input)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(v._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--adm-text-40)] hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(panel === 'create' || panel === 'edit') && (
            <div className="p-8 max-w-lg">
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setPanel('list')} className="p-2 rounded-xl hover:bg-[var(--adm-surface)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-2xl font-semibold text-[var(--adm-text)]">
                  {panel === 'create' ? 'Nouvelle valeur' : 'Modifier la valeur'}
                </h1>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Icône (emoji)</label>
                    <input
                      type="text"
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      placeholder="🌿"
                      className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-2xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Ordre</label>
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
                    placeholder="Ex : Naturel"
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Description *</label>
                  <textarea
                    rows={3}
                    value={form.desc}
                    onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                    placeholder="Décrivez cette valeur en une ou deux phrases..."
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] transition-colors text-sm resize-none"
                  />
                </div>

                {/* Aperçu */}
                {(form.icon || form.title || form.desc) && (
                  <div className="p-5 bg-[var(--adm-surface)] border border-[var(--adm-border)] rounded-xl">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-30)] mb-3">Aperçu</p>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-4xl mb-3">{form.icon || '💎'}</span>
                      <p className="text-[var(--adm-text)] text-xs font-medium uppercase tracking-widest mb-2">{form.title}</p>
                      <p className="text-[var(--adm-text-30)] text-xs leading-relaxed">{form.desc}</p>
                    </div>
                  </div>
                )}

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
                    {panel === 'create' ? 'Créer la valeur' : 'Enregistrer'}
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
