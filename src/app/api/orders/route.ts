import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAllOrders, createOrder } from '@/lib/order-store';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

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

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const sessionUser = token ? verifySession(token) : null;

    const order = await createOrder({
      customer, items,
      subtotal: Number(subtotal),
      discount: Number(discount) || 0,
      shipping: Number(shipping),
      total: Number(total),
      promoCode: promoCode || '',
      status: 'confirmed',
      userId: sessionUser?.userId ?? '',
    });

    // Décrémenter le stock de chaque article commandé
    await dbConnect();
    await Promise.all(
      items.map((item: { _id: string; qty: number }) =>
        mongoose.connection.db!.collection('products').updateOne(
          { _id: new mongoose.Types.ObjectId(item._id) },
          { $inc: { stock: -item.qty } }
        )
      )
    );

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
