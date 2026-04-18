import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/order-store';
import { sendInvoiceEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  try {
    await sendInvoiceEmail(order.customer.email, order);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
