'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface OrderItem { name: string; qty: number; price: number; }
interface Customer { prenom: string; nom: string; email: string; telephone: string; adresse: string; cp: string; ville: string; pays: string; }
interface Order {
  _id: string;
  orderNumber: number;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  status: string;
  stripeSessionId?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',  color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20' },
  confirmed: { label: 'Confirmée',   color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  shipped:   { label: 'Expédiée',    color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20' },
  delivered: { label: 'Livrée',      color: 'text-purple-400',  bg: 'bg-purple-400/10 border-purple-400/20' },
  cancelled: { label: 'Annulée',     color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' },
  refunded:  { label: 'Remboursée',  color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20' },
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];

function formatNum(n: number) { return String(n).padStart(7, '0'); }
function eur(n: number) { return n.toFixed(2) + ' €'; }

export default function AdminCommandes() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [updating, setUpdating]     = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmRefund, setConfirmRefund]   = useState<Order | null>(null);
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      setOrders(await res.json());
    } catch { showToast('Impossible de charger les commandes', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (order: Order, status: string) => {
    if (status === 'refunded') { setConfirmRefund(order); return; }
    await doUpdate(order._id, status);
  };

  const resendInvoice = async (id: string) => {
    setSendingInvoice(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/resend-invoice`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showToast('Facture envoyée par email ✓');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setSendingInvoice(null);
    }
  };

  const doUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      showToast(status === 'refunded' ? 'Remboursement effectué via Stripe ✓' : 'Statut mis à jour ✓');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(null);
      setConfirmRefund(null);
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || String(o.orderNumber).includes(q)
      || o.customer.email.toLowerCase().includes(q)
      || `${o.customer.prenom} ${o.customer.nom}`.toLowerCase().includes(q);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    revenue: orders.filter(o => !['cancelled','refunded'].includes(o.status)).reduce((s, o) => s + o.total, 0),
    pending: orders.filter(o => o.status === 'pending').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
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

      {/* Confirm remboursement */}
      {confirmRefund && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--adm-card)] border border-[var(--adm-border-input)] rounded-2xl p-8 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <h3 className="text-center text-[var(--adm-text)] font-semibold text-lg mb-1">Confirmer le remboursement</h3>
            <p className="text-center text-[var(--adm-text-40)] text-sm mb-2">
              Commande #{formatNum(confirmRefund.orderNumber)}
            </p>
            <p className="text-center text-orange-400 font-bold text-xl mb-6">{eur(confirmRefund.total)}</p>
            <p className="text-center text-[var(--adm-text-30)] text-xs mb-6">
              Le remboursement sera effectué automatiquement via Stripe sur le moyen de paiement d&apos;origine. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRefund(null)}
                className="flex-1 py-3 rounded-xl border border-[var(--adm-border-input)] text-[var(--adm-text-60)] text-sm hover:bg-[var(--adm-surface)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => doUpdate(confirmRefund._id, 'refunded')}
                disabled={!!updating}
                className="flex-1 py-3 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm hover:bg-orange-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating && <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />}
                Rembourser
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[var(--adm-text)]">Commandes</h1>
            <p className="text-[var(--adm-text-30)] text-sm mt-1">Gérez et suivez toutes les commandes clients</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total commandes', value: stats.total, color: 'text-[var(--adm-text)]' },
              { label: 'Chiffre d\'affaires', value: eur(stats.revenue), color: 'text-emerald-400' },
              { label: 'En attente', value: stats.pending, color: 'text-amber-400' },
              { label: 'Remboursées', value: stats.refunded, color: 'text-orange-400' },
            ].map(s => (
              <div key={s.label} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-5">
                <p className="text-[var(--adm-text-30)] text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Rechercher (nom, email, n° commande…)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-64 bg-[var(--adm-surface)] border border-[var(--adm-border-input)] rounded-xl px-4 py-2.5 text-sm text-[var(--adm-text)] placeholder-[var(--adm-placeholder)] focus:outline-none focus:border-[var(--adm-border-focus)]"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[var(--adm-select)] border border-[var(--adm-border-input)] rounded-xl px-4 py-2.5 text-sm text-[var(--adm-text)] focus:outline-none focus:border-[var(--adm-border-focus)]"
            >
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
              ))}
            </select>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-[var(--adm-spinner-ring)] border-t-[var(--adm-spinner-top)] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[var(--adm-text-30)] text-sm">Aucune commande trouvée.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const sc  = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed;
                const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                const isExpanded = expanded === order._id;

                return (
                  <div key={order._id} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl overflow-hidden">

                    {/* Ligne principale */}
                    <div className="flex flex-wrap items-center gap-4 px-6 py-4">
                      {/* Numéro + date */}
                      <div className="min-w-[120px]">
                        <p className="text-xs font-mono font-semibold text-[var(--adm-text)]">#{formatNum(order.orderNumber)}</p>
                        <p className="text-xs text-[var(--adm-text-30)] mt-0.5">{date}</p>
                      </div>

                      {/* Client */}
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-sm font-medium text-[var(--adm-text)]">{order.customer.prenom} {order.customer.nom}</p>
                        <p className="text-xs text-[var(--adm-text-40)]">{order.customer.email}</p>
                      </div>

                      {/* Articles résumé */}
                      <div className="hidden lg:block text-xs text-[var(--adm-text-40)] min-w-[140px]">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                        {order.items[0] && <span> · {order.items[0].name}{order.items.length > 1 ? '…' : ''}</span>}
                      </div>

                      {/* Total */}
                      <div className="text-sm font-bold text-[var(--adm-text)] min-w-[80px] text-right">
                        {eur(order.total)}
                      </div>

                      {/* Statut selector */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} whitespace-nowrap`}>
                          {sc.label}
                        </span>
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order, e.target.value)}
                          disabled={updating === order._id || order.status === 'refunded'}
                          className="bg-[var(--adm-select)] border border-[var(--adm-border-input)] rounded-lg px-2 py-1.5 text-xs text-[var(--adm-text)] focus:outline-none disabled:opacity-40 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                          ))}
                        </select>
                        {updating === order._id && (
                          <div className="w-4 h-4 border-2 border-[var(--adm-spinner-ring)] border-t-[var(--adm-spinner-top)] rounded-full animate-spin" />
                        )}
                      </div>

                      {/* Toggle détails */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : order._id)}
                        className="p-2 rounded-lg hover:bg-[var(--adm-surface)] text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-all"
                      >
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Détails dépliables */}
                    {isExpanded && (
                      <div className="border-t border-[var(--adm-border)] px-6 py-5 bg-[var(--adm-surface)]/30">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                          {/* Articles */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-30)] mb-3">Articles</p>
                            <div className="space-y-2">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-[var(--adm-text-60)]">{item.name} <span className="text-[var(--adm-text-30)]">×{item.qty}</span></span>
                                  <span className="text-[var(--adm-text)]">{eur(item.price * item.qty)}</span>
                                </div>
                              ))}
                              <div className="border-t border-[var(--adm-border)] pt-2 mt-2 space-y-1">
                                <div className="flex justify-between text-xs text-[var(--adm-text-40)]">
                                  <span>Sous-total</span><span>{eur(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-xs text-[var(--adm-text-40)]">
                                    <span>Réduction {order.promoCode && `(${order.promoCode})`}</span>
                                    <span>−{eur(order.discount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-xs text-[var(--adm-text-40)]">
                                  <span>Livraison</span><span>{order.shipping === 0 ? 'Offerte' : eur(order.shipping)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-[var(--adm-text)] pt-1">
                                  <span>Total TTC</span><span>{eur(order.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Livraison */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-30)] mb-3">Adresse de livraison</p>
                            <div className="text-sm text-[var(--adm-text-60)] space-y-1">
                              {[
                                { key: `${order._id}-name`,  value: `${order.customer.prenom} ${order.customer.nom}`, bold: true },
                                { key: `${order._id}-addr`,  value: order.customer.adresse },
                                { key: `${order._id}-cpv`,   value: [order.customer.cp, order.customer.ville].filter(Boolean).join(' ') },
                                { key: `${order._id}-pays`,  value: order.customer.pays },
                                { key: `${order._id}-email`, value: order.customer.email },
                                { key: `${order._id}-tel`,   value: order.customer.telephone },
                              ].filter(f => f.value).map(f => (
                                <button
                                  key={f.key}
                                  onClick={() => copy(f.value, f.key)}
                                  title="Cliquer pour copier"
                                  className={`group flex items-center gap-2 w-full text-left rounded px-1.5 py-0.5 transition-colors hover:bg-[var(--adm-surface)] ${f.bold ? 'font-medium text-[var(--adm-text)]' : ''}`}
                                >
                                  <span className="flex-1">{f.value}</span>
                                  <span className={`text-[10px] shrink-0 transition-all ${copied === f.key ? 'text-emerald-400 opacity-100' : 'text-[var(--adm-text-20)] opacity-0 group-hover:opacity-100'}`}>
                                    {copied === f.key ? '✓ Copié' : 'Copier'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-[var(--adm-border)] flex flex-wrap items-center gap-4 justify-between">
                          <div className="flex items-center gap-4">
                            <a
                              href={`/facture/${order._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--adm-text-40)] hover:text-[var(--adm-text)] transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Voir la facture
                            </a>
                            <button
                              onClick={() => resendInvoice(order._id)}
                              disabled={sendingInvoice === order._id}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {sendingInvoice === order._id
                                ? <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                              }
                              Renvoyer la facture par mail
                            </button>
                          </div>
                          {order.status !== 'refunded' && order.stripeSessionId && (
                            <button
                              onClick={() => setConfirmRefund(order)}
                              className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Rembourser via Stripe
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
