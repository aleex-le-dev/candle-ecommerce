import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder } from '@/lib/order-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getAllOrders());
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, subtotal, discount, shipping, total, promoCode } = body;
    if (!customer || !items?.length) {
      return NextResponse.json({ error: 'Données de commande incomplètes' }, { status: 400 });
    }
    const order = await createOrder({
      customer, items,
      subtotal: Number(subtotal),
      discount: Number(discount) || 0,
      shipping: Number(shipping),
      total: Number(total),
      promoCode: promoCode || '',
      status: 'confirmed',
    });
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 });
  }
}
