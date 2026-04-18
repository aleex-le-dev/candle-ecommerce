import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { customer, items, subtotal, discount, shipping, total, promoCode, freeShipping } = await req.json();

  if (!items?.length) return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
  if (total < 0.5) return NextResponse.json({ error: 'Le montant minimum pour le paiement en ligne est de 0,50 €.' }, { status: 400 });

  // Stocker la commande en attente en DB pour récupérer après paiement
  await dbConnect();
  const db = mongoose.connection.db!;
  const pending = await db.collection('pending_orders').insertOne({
    customer, items, subtotal, discount, shipping, total, promoCode,
    createdAt: new Date(),
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.qty,
  }));

  // Frais de livraison comme ligne séparée (sauf si offerts)
  if (shipping > 0 && !freeShipping) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Frais de livraison' },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  // Réduction comme coupon si applicable
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
  if (discount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(discount * 100),
      currency: 'eur',
      duration: 'once',
      name: promoCode ? `Code ${promoCode}` : 'Réduction',
    });
    discounts.push({ coupon: coupon.id });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    ...(discounts.length ? { discounts } : {}),
    mode: 'payment',
    customer_email: customer.email,
    billing_address_collection: 'auto',
    locale: 'fr',
    metadata: { pendingOrderId: pending.insertedId.toString() },
    success_url: `${baseUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/paiement`,
  });

  return NextResponse.json({ url: session.url });
}
