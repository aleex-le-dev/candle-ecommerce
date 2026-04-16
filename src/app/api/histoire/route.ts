import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/histoire-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getAllArticles());
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la récupération des articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { theme, title, body: text, image, imageAlt, order } = body;
    if (!theme || !title || !text) {
      return NextResponse.json({ error: 'Thème, titre et texte sont requis' }, { status: 400 });
    }
    const article = await createArticle({
      theme, title, body: text,
      image: image || '',
      imageAlt: imageAlt || '',
      order: Number(order) || 0,
    });
    return NextResponse.json(article, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
