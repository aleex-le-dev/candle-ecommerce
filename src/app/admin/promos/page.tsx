'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface PromoCode {
  _id: string;
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

const EMPTY_FORM = {
  code: '',
  type: 'percent' as 'percent' | 'fixed' | 'shipping',
  value: '',
  minOrder: '',
  active: true,
  expiresAt: '',
};

export default function AdminPromos() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
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

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promos');
      setPromos(await res.json());
    } catch {
      showToast('Impossible de charger les codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    fetchPromos().then(() => { if (searchParams.get('new') === '1') openCreate(); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setPanel('create');
  };

  const openEdit = (p: PromoCode) => {
    setForm({
      code: p.code,
      type: p.type as 'percent' | 'fixed' | 'shipping',
      value: String(p.value),
      minOrder: String(p.minOrder),
      active: p.active,
      expiresAt: p.expiresAt ? p.expiresAt.split('T')[0] : '',
    });
    setEditId(p._id);
    setPanel('edit');
  };

  const handleSave = async () => {
    if (!form.code) {
      showToast('Le code est requis', 'error');
      return;
    }
    if (form.type !== 'shipping' && !form.value) {
      showToast('La valeur est requise', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        expiresAt: form.expiresAt || undefined,
      };
      const url = panel === 'edit' ? `/api/promos/${editId}` : '/api/promos';
      const method = panel === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      showToast(panel === 'edit' ? 'Code mis à jour ✓' : 'Code créé ✓');
      setPanel('list');
      fetchPromos();
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/promos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Code supprimé');
      setDeleteConfirm(null);
      fetchPromos();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const isExpired = (p: PromoCode) => !!p.expiresAt && new Date(p.expiresAt) < new Date();

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
            <h3 className="text-center text-[var(--adm-text)] font-semibold text-lg mb-2">Supprimer ce code ?</h3>
            <p className="text-center text-[var(--adm-text-40)] text-sm mb-6">Cette action est irréversible.</p>
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
        <main className="flex-1 overflow-y-auto">
          {panel === 'list' && (
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[var(--adm-text)]">Codes Promo</h1>
                <p className="text-[var(--adm-text-30)] text-sm mt-1">Gérez vos codes de réduction</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-[var(--adm-spinner-ring)] border-t-[var(--adm-spinner-top)] rounded-full animate-spin" />
                </div>
              ) : promos.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">🏷️</div>
                  <p className="text-[var(--adm-text-30)] text-sm">Aucun code promo. Créez votre premier code !</p>
                </div>
              ) : (
                <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--adm-border)]">
                        <th className="text-left text-xs font-medium text-[var(--adm-text-30)] uppercase tracking-wider px-6 py-4">Code</th>
                        <th className="text-left text-xs font-medium text-[var(--adm-text-30)] uppercase tracking-wider px-4 py-4">Réduction</th>
                        <th className="text-left text-xs font-medium text-[var(--adm-text-30)] uppercase tracking-wider px-4 py-4">Min. commande</th>
                        <th className="text-left text-xs font-medium text-[var(--adm-text-30)] uppercase tracking-wider px-4 py-4">Expiration</th>
                        <th className="text-left text-xs font-medium text-[var(--adm-text-30)] uppercase tracking-wider px-4 py-4">Statut</th>
                        <th className="px-4 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--adm-border)]">
                      {promos.map(p => (
                        <tr key={p._id} className="group hover:bg-[var(--adm-surface)] transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-[var(--adm-text)] font-mono font-semibold tracking-wider text-sm">{p.code}</span>
                          </td>
                          <td className="px-4 py-4 text-[var(--adm-text)] text-sm">
                            {p.type === 'shipping' ? 'Livraison offerte' : p.type === 'percent' ? `${p.value}%` : `${p.value.toFixed(2)} €`}
                          </td>
                          <td className="px-4 py-4 text-[var(--adm-text-40)] text-sm">
                            {p.minOrder > 0 ? `${p.minOrder.toFixed(2)} €` : '—'}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {p.expiresAt ? (
                              <span className={isExpired(p) ? 'text-red-400' : 'text-[var(--adm-text-40)]'}>
                                {new Date(p.expiresAt).toLocaleDateString('fr-FR')}
                                {isExpired(p) && ' (expiré)'}
                              </span>
                            ) : (
                              <span className="text-[var(--adm-text-30)]">Sans limite</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {p.active && !isExpired(p) ? (
                              <span className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Actif</span>
                            ) : (
                              <span className="text-xs text-[var(--adm-text-30)] bg-[var(--adm-surface)] px-3 py-1 rounded-full">Inactif</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-[var(--adm-surface-lg)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => setDeleteConfirm(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--adm-text-40)] hover:text-red-400 transition-all">
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
            <div className="p-8 max-w-xl">
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setPanel('list')} className="p-2 rounded-xl hover:bg-[var(--adm-surface)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-[var(--adm-text)]">
                  {panel === 'create' ? 'Nouveau code promo' : 'Modifier le code'}
                </h1>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="EX: SUMMER20"
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] font-mono tracking-wider text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Type *</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' | 'shipping', value: '' }))}
                      className="w-full bg-[var(--adm-select)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] focus:outline-none focus:border-[var(--adm-border-focus)] text-sm"
                    >
                      <option value="percent">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (€)</option>
                      <option value="shipping">Livraison gratuite</option>
                    </select>
                  </div>
                  {form.type !== 'shipping' && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">
                        Valeur * {form.type === 'percent' ? '(%)' : '(€)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={form.type === 'percent' ? '1' : '0.01'}
                        max={form.type === 'percent' ? '100' : undefined}
                        value={form.value}
                        onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                        placeholder={form.type === 'percent' ? '20' : '10.00'}
                        className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] text-sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Commande minimum (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrder}
                    onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                    placeholder="0.00 (aucun minimum)"
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--adm-text-40)] uppercase tracking-wider mb-2">Date d&apos;expiration</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-3 text-[var(--adm-text)] focus:outline-none focus:border-[var(--adm-border-focus)] text-sm"
                  />
                  <p className="text-[var(--adm-text-20)] text-xs mt-1">Laisser vide pour un code sans limite de durée</p>
                </div>

                <label className="flex items-center gap-4 p-4 bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl cursor-pointer hover:bg-[var(--adm-surface-md)] transition-colors">
                  <div className="relative">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-[var(--adm-surface-lg)]'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-transform ${form.active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[var(--adm-text)] text-sm font-medium">Code actif</p>
                    <p className="text-[var(--adm-text-30)] text-xs">Les clients peuvent utiliser ce code</p>
                  </div>
                </label>

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
                    {panel === 'create' ? 'Créer le code' : 'Enregistrer'}
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
