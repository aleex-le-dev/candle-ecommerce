'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface Category { _id: string; name: string; createdAt: string; }

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const [catsRes, countsRes] = await Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/admin/counts').then(r => r.json()),
    ]);
    setCats(catsRes);
    if (!countsRes.error) setCounts(countsRes);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) { setNewName(''); showToast('Catégorie créée ✓'); load(); }
    else { const d = await res.json(); showToast(d.error || 'Erreur', 'error'); }
    setCreating(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) { setEditId(null); showToast('Catégorie renommée ✓'); load(); }
    else showToast('Erreur lors de la modification', 'error');
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    showToast('Catégorie supprimée');
    load();
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
          <div className="bg-[var(--adm-card)] border border-[var(--adm-border-input)] rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-center text-[var(--adm-text)] font-semibold text-lg mb-2">Supprimer cette catégorie ?</h3>
            <p className="text-center text-[var(--adm-text-40)] text-sm mb-6">Les produits associés ne seront pas supprimés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-[var(--adm-border-input)] text-[var(--adm-text-60)] text-sm hover:bg-[var(--adm-surface)] transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[var(--adm-text)]">Catégories</h1>
            <p className="text-[var(--adm-text-30)] text-sm mt-1">Gérez les catégories de produits de la boutique</p>
          </div>

          {/* Créer */}
          <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-6 mb-6 max-w-xl">
            <h2 className="text-sm font-medium text-[var(--adm-text)] mb-4">Nouvelle catégorie</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Ex : Florale, Boisée, Gourmande…"
                className="flex-1 bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-2.5 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] text-sm"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-5 py-2.5 rounded-xl bg-[var(--adm-cta-bg)] text-[var(--adm-cta-text)] text-sm font-medium hover:bg-[var(--adm-cta-hover)] transition-colors disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-[var(--adm-spinner-ring)] border-t-[var(--adm-spinner-top)] rounded-full animate-spin" />
            </div>
          ) : cats.length === 0 ? (
            <div className="text-center py-24 text-[var(--adm-text-30)] text-sm">Aucune catégorie. Créez-en une ci-dessus.</div>
          ) : (
            <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl overflow-hidden max-w-xl">
              {cats.map((cat, i) => (
                <div key={cat._id} className={`flex items-center gap-3 px-6 py-4 ${i < cats.length - 1 ? 'border-b border-[var(--adm-border)]' : ''}`}>
                  {editId === cat._id ? (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEdit(cat._id); if (e.key === 'Escape') setEditId(null); }}
                        className="flex-1 bg-[var(--adm-surface)] border border-[var(--adm-border-focus)] rounded-lg px-3 py-1.5 text-[var(--adm-text)] text-sm focus:outline-none"
                      />
                      <button onClick={() => handleEdit(cat._id)} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--adm-cta-bg)] text-[var(--adm-cta-text)] hover:bg-[var(--adm-cta-hover)] transition-colors">OK</button>
                      <button onClick={() => setEditId(null)} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--adm-border-input)] text-[var(--adm-text-40)] hover:bg-[var(--adm-surface)] transition-colors">Annuler</button>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-lg bg-[var(--adm-surface)] flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-[var(--adm-text-40)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      </div>
                      <span className="flex-1 text-sm text-[var(--adm-text)]">{cat.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditId(cat._id); setEditName(cat.name); }} className="p-2 rounded-lg hover:bg-[var(--adm-surface-lg)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(cat._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--adm-text-40)] hover:text-red-400 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
