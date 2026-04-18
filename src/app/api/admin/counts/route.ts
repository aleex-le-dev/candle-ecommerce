import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const db = mongoose.connection.db!;
    const [products, promos, histoire, valeurs, categories] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('promos').countDocuments(),
      db.collection('articles').countDocuments(),
      db.collection('valeurs').countDocuments(),
      db.collection('categories').countDocuments(),
    ]);
    return NextResponse.json({ products, promos, histoire, valeurs, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
