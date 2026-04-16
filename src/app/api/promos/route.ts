import { NextRequest, NextResponse } from 'next/server';
import { getAllPromos, createPromo } from '@/lib/promo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getAllPromos());
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, type, value, minOrder, active, expiresAt } = await req.json();
    if (!code || !type || value == null) {
      return NextResponse.json({ error: 'code, type et value sont requis' }, { status: 400 });
    }
    const promo = await createPromo({
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      active: active !== false,
      expiresAt: expiresAt || undefined,
    });
    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
