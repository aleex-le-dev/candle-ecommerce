import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle } from '@/lib/histoire-store';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/histoire/[id]'>) {
  const { id } = await ctx.params;
  const article = getArticleById(id);
  if (!article) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/histoire/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const updated = updateArticle(id, body);
    if (!updated) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/histoire/[id]'>) {
  const { id } = await ctx.params;
  const success = deleteArticle(id);
  if (!success) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
  return NextResponse.json({ success: true });
}
