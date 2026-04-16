import { NextRequest, NextResponse } from 'next/server';
import { getValeurById, updateValeur, deleteValeur } from '@/lib/valeurs-store';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/valeurs/[id]'>) {
  const { id } = await ctx.params;
  const valeur = getValeurById(id);
  if (!valeur) return NextResponse.json({ error: 'Valeur introuvable' }, { status: 404 });
  return NextResponse.json(valeur);
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/valeurs/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const updated = updateValeur(id, body);
    if (!updated) return NextResponse.json({ error: 'Valeur introuvable' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/valeurs/[id]'>) {
  const { id } = await ctx.params;
  const success = deleteValeur(id);
  if (!success) return NextResponse.json({ error: 'Valeur introuvable' }, { status: 404 });
  return NextResponse.json({ success: true });
}
