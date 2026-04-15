import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const { id } = await ctx.params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const updated = updateProduct(id, body);
    if (!updated) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const { id } = await ctx.params;
  const success = deleteProduct(id);
  if (!success) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  return NextResponse.json({ success: true });
}
