import { NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/order-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
