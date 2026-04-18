import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import { getOrderById } from '@/lib/order-store';
import PrintButton from './PrintButton';

function eur(n: number) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function pad(n: number) {
  return String(n).padStart(7, '0');
}

export default async function FacturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) redirect('/compte/connexion');

  const order = await getOrderById(id);
  if (!order) notFound();
  if (order.userId && order.userId !== session.userId) notFound();

  const dateStr = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const cpVille = [order.customer.cp, order.customer.ville].filter(Boolean).join(' ');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .invoice { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Barre d'actions (cachée à l'impression) */}
      <div className="no-print bg-neutral-50 border-b border-neutral-200 py-4 px-6 flex items-center gap-4">
        <a href="/compte?tab=commandes" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Mes commandes
        </a>
        <span className="text-neutral-200">|</span>
        <PrintButton />
      </div>

      {/* Facture */}
      <div className="invoice bg-white max-w-2xl mx-auto my-10 px-14 py-12 shadow-sm font-sans text-neutral-900">

        {/* En-tête */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-2xl font-bold text-neutral-900 mb-1">Lumière</p>
            <p className="text-xs text-neutral-400">Bougies artisanales naturelles</p>
            <p className="text-xs text-neutral-400">contact@lumiere-bougies.fr</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-neutral-900 mb-1">FACTURE</p>
            <p className="text-xs text-neutral-500">N° {pad(order.orderNumber)}</p>
            <p className="text-xs text-neutral-500">Date : {dateStr}</p>
          </div>
        </div>

        <hr className="border-neutral-200 mb-8" />

        {/* Adresse client */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Facturé à</p>
          <p className="font-semibold text-base mb-1">{order.customer.prenom} {order.customer.nom}</p>
          {order.customer.adresse && <p className="text-sm text-neutral-500">{order.customer.adresse}</p>}
          {cpVille && <p className="text-sm text-neutral-500">{cpVille}</p>}
          {order.customer.pays && <p className="text-sm text-neutral-500">{order.customer.pays}</p>}
          <p className="text-sm text-neutral-500">{order.customer.email}</p>
        </div>

        {/* Tableau articles */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <th className="text-left py-3 px-3">Désignation</th>
              <th className="text-right py-3 px-3 w-16">Qté</th>
              <th className="text-right py-3 px-3 w-24">P.U.</th>
              <th className="text-right py-3 px-3 w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="py-3 px-3 text-neutral-800">{item.name}</td>
                <td className="py-3 px-3 text-right text-neutral-500">{item.qty}</td>
                <td className="py-3 px-3 text-right text-neutral-500">{eur(item.price)}</td>
                <td className="py-3 px-3 text-right font-medium text-neutral-800">{eur(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="flex justify-end mb-6">
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Sous-total</span>
              <span>{eur(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Réduction</span>
                <span>−{eur(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Livraison</span>
              <span>{order.shipping === 0 ? 'Offerte' : eur(order.shipping)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-base text-neutral-900">
              <span>Total TTC</span>
              <span>{eur(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Code promo */}
        {order.promoCode && (
          <p className="text-xs text-neutral-400 mb-6">Code promo appliqué : {order.promoCode}</p>
        )}

        {/* Pied de page */}
        <hr className="border-neutral-100 mt-10 mb-4" />
        <p className="text-center text-[10px] text-neutral-400">
          Lumière Bougies — TVA non applicable, art. 293 B du CGI — Merci pour votre commande !
        </p>
      </div>
    </>
  );
}
