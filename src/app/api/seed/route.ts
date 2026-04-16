import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import PromoModel from '@/lib/models/Promo';
import ArticleModel from '@/lib/models/Article';
import ValeurModel from '@/lib/models/Valeur';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function readJSON(filename: string) {
  const p = path.join(process.cwd(), 'src', 'lib', filename);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export async function GET() {
  await dbConnect();

  const products = readJSON('products.json');
  const promos   = readJSON('promos.json');
  const articles = readJSON('histoire.json');
  const valeurs  = readJSON('valeurs.json');

  const results: Record<string, any> = {};

  // ── Produits ──
  if (products.length) {
    await ProductModel.deleteMany({});
    const docs = products.map(({ _id, ...rest }: any) => rest);
    const inserted = await ProductModel.insertMany(docs);
    results.products = `${inserted.length} insérés`;
  } else {
    results.products = 'aucun fichier';
  }

  // ── Promos ──
  if (promos.length) {
    await PromoModel.deleteMany({});
    const docs = promos.map(({ _id, ...rest }: any) => rest);
    const inserted = await PromoModel.insertMany(docs);
    results.promos = `${inserted.length} insérés`;
  } else {
    results.promos = 'aucun fichier';
  }

  // ── Articles Notre Histoire ──
  if (articles.length) {
    await ArticleModel.deleteMany({});
    const docs = articles.map(({ _id, ...rest }: any) => rest);
    const inserted = await ArticleModel.insertMany(docs);
    results.articles = `${inserted.length} insérés`;
  } else {
    results.articles = 'aucun fichier';
  }

  // ── Valeurs ──
  if (valeurs.length) {
    await ValeurModel.deleteMany({});
    const docs = valeurs.map(({ _id, ...rest }: any) => rest);
    const inserted = await ValeurModel.insertMany(docs);
    results.valeurs = `${inserted.length} insérés`;
  } else {
    results.valeurs = 'aucun fichier';
  }

  return NextResponse.json({ ok: true, results });
}
