import { NextRequest, NextResponse } from 'next/server';
import { getAllValeurs, createValeur } from '@/lib/valeurs-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(getAllValeurs());
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la récupération des valeurs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { icon, title, desc, order } = body;
    if (!title || !desc) {
      return NextResponse.json({ error: 'Titre et description sont requis' }, { status: 400 });
    }
    const valeur = createValeur({ icon: icon || '', title, desc, order: Number(order) || 0 });
    return NextResponse.json(valeur, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
