import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/lib/models/Category';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  const db = mongoose.connection.db!;

  const [saved, fromProducts] = await Promise.all([
    CategoryModel.find().sort({ name: 1 }),
    db.collection('products').distinct('category'),
  ]);

  const savedNames = new Set(saved.map((c: any) => c.name));

  // Catégories issues des produits mais pas encore dans la collection → on les crée silencieusement
  const missing = (fromProducts as string[]).filter(n => n && !savedNames.has(n));
  if (missing.length) {
    await Promise.allSettled(missing.map(name => CategoryModel.create({ name })));
  }

  const all = await CategoryModel.find().sort({ name: 1 });
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  try {
    const cat = await CategoryModel.create({ name: name.trim() });
    return NextResponse.json(cat, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 409 });
  }
}
