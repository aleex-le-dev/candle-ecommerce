import { NextRequest, NextResponse } from 'next/server';
import { updatePromo, deletePromo } from '@/lib/promo-store';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/promos/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    if (body.code) body.code = body.code.toUpperCase().trim();
    const updated = await updatePromo(id, body);
    if (!updated) return NextResponse.json({ error: 'Code introuvable' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/promos/[id]'>) {
  const { id } = await ctx.params;
  const ok = await deletePromo(id);
  if (!ok) return NextResponse.json({ error: 'Code introuvable' }, { status: 404 });
  return NextResponse.json({ success: true });
}
