import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { createOrder } from '@/lib/order-store';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ error: 'session_id manquant' }, { status: 400 });

  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

  if (stripeSession.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 402 });
  }

  await dbConnect();
  const db = mongoose.connection.db!;

  // Vérifier si la commande a déjà été créée (idempotence)
  const existing = await db.collection('orders').findOne({ stripeSessionId: sessionId });
  if (existing) {
    return NextResponse.json({ orderNumber: existing.orderNumber, alreadyCreated: true });
  }

  const pendingId = stripeSession.metadata?.pendingOrderId;
  if (!pendingId) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const pending = await db.collection('pending_orders').findOne({
    _id: new mongoose.Types.ObjectId(pendingId),
  });
  if (!pending) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const sessionUser = token ? verifySession(token) : null;

  const order = await createOrder({
    customer: pending.customer,
    items: pending.items,
    subtotal: pending.subtotal,
    discount: pending.discount,
    shipping: pending.shipping,
    total: pending.total,
    promoCode: pending.promoCode,
    status: 'confirmed',
    userId: sessionUser?.userId ?? '',
    stripeSessionId: sessionId,
  });

  // Décrémenter le stock
  await Promise.all(
    pending.items.map((item: { _id: string; qty: number }) =>
      db.collection('products').updateOne(
        { _id: new mongoose.Types.ObjectId(item._id) },
        { $inc: { stock: -item.qty } }
      )
    )
  );

  // Nettoyer la commande en attente
  await db.collection('pending_orders').deleteOne({ _id: new mongoose.Types.ObjectId(pendingId) });

  return NextResponse.json({ orderNumber: order.orderNumber });
}
