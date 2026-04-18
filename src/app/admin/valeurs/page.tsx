'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useSearchParams } from 'next/navigation';

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
        <AdminSidebar />

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
                      <div className="flex gap-2 mt-5">
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
