import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderById, updateOrderStatus } from '@/lib/order-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = 'force-dynamic';

// PATCH /api/admin/orders/[id] — change status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  if (!status) return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });

  // Si remboursement demandé → appel Stripe en premier
  if (status === 'refunded') {
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

    if (!order.stripeSessionId) {
      return NextResponse.json({ error: 'Pas de session Stripe associée à cette commande' }, { status: 400 });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      const paymentIntent = session.payment_intent as string;

      if (!paymentIntent) {
        return NextResponse.json({ error: 'Payment Intent introuvable' }, { status: 400 });
      }

      await stripe.refunds.create({ payment_intent: paymentIntent });
    } catch (err: any) {
      return NextResponse.json({ error: `Erreur Stripe : ${err.message}` }, { status: 500 });
    }
  }

  const updated = await updateOrderStatus(id, status);
  if (!updated) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  return NextResponse.json(updated);
}
