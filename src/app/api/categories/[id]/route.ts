import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/lib/models/Category';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const cat = await CategoryModel.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
  if (!cat) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json(cat);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  await CategoryModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
