import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, price, description, details, burnTime, weight, image, gallery, stock, featured } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Nom et prix sont requis' }, { status: 400 });
    }

    const product = createProduct({
      name,
      category: category || 'Non catégorisé',
      price: Number(price),
      description: description || '',
      details: details || '',
      burnTime: burnTime || '',
      weight: weight || '',
      image: image || '',
      gallery: gallery || [],
      stock: Number(stock) || 0,
      featured: Boolean(featured),
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 });
  }
}
