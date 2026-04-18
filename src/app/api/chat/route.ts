import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function productUrl(category: string, name: string) {
  return `/${slugify(category)}/${slugify(name)}`;
}

export const dynamic = 'force-dynamic';

async function getStoreContext(db: any) {
  const [products, promos] = await Promise.all([
    db.collection('products').find({}).toArray(),
    db.collection('promos').find({ active: true }).toArray(),
  ]);

  const categories = [...new Set(products.map((p: any) => p.category))];
  const bestsellers = products.filter((p: any) => p.featured).map((p: any) => `${p.name} (${p.price.toFixed(2)} €)`);
  const priceRange = products.length
    ? `de ${Math.min(...products.map((p: any) => p.price)).toFixed(2)} € à ${Math.max(...products.map((p: any) => p.price)).toFixed(2)} €`
    : 'non disponible';
  const productList = products.map((p: any) =>
    `- ${p.name} | Catégorie: ${p.category} | Prix: ${p.price.toFixed(2)} € | Stock: ${p.stock > 0 ? 'En stock' : 'Rupture'} | URL: ${productUrl(p.category, p.name)}${p.image ? ` | Image: ${p.image}` : ''}`
  ).join('\n');
  const promoList = promos.map((p: any) =>
    `- Code "${p.code}" : ${p.type === 'percent' ? `${p.value}% de réduction` : `${p.value} € de réduction`}${p.minOrder ? ` (commande min. ${p.minOrder} €)` : ''}`
  ).join('\n');

  return { categories, bestsellers, priceRange, productList, promoList };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 });

  const { messages } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: 'Messages requis' }, { status: 400 });

  await dbConnect();
  const db = mongoose.connection.db!;
  const ctx = await getStoreContext(db);

  const systemPrompt = `Tu es l'assistant virtuel de la boutique Lumière, une boutique en ligne française spécialisée dans les bougies artisanales haut de gamme. Tu réponds en français, de façon chaleureuse, concise et élégante.

## La boutique
- Nom : Lumière
- Spécialité : Bougies artisanales
- Livraison : France, Belgique, Suisse, Luxembourg, Canada
- Paiement : Carte bancaire sécurisée
- Contact : alexandre.janacek@gmail.com

## Horaires du service client
- Lundi – Vendredi : 9h00 – 18h00
- Samedi : 10h00 – 16h00
- Dimanche : Fermé

## Délais de livraison
- France : 3-5 jours ouvrés
- Livraison gratuite dès 50 € d'achat en France
- Belgique / Luxembourg : 4-6 jours ouvrés
- Suisse / Canada : 7-10 jours ouvrés

## Retours
- 14 jours pour retourner un article non utilisé dans son emballage d'origine
- Remboursement sous 5-7 jours ouvrés après réception

## Catégories disponibles
${ctx.categories.length ? (ctx.categories as string[]).map(c => `- ${c}`).join('\n') : '- En cours de mise à jour'}

## Gamme de prix
${ctx.priceRange}

## Produits vedettes (best-sellers)
${ctx.bestsellers.length ? ctx.bestsellers.join('\n') : 'Aucun produit vedette pour le moment'}

## Catalogue complet
${ctx.productList || 'Catalogue en cours de mise à jour'}

## Codes promo actifs
${ctx.promoList || 'Aucun code promo actif en ce moment'}

## Règles
- Ne jamais inventer de prix ou de produits absents du catalogue
- Si une information est inconnue, dire poliment que l'équipe peut être contactée
- Ne pas traiter de commandes ni de remboursements directement
- Réponses courtes (3-4 phrases max sauf si liste demandée)
- Quand tu mentionnes un produit, inclure toujours un lien cliquable en markdown : [Nom du produit](URL)
- Si le produit a une image, l'afficher en markdown AVANT le lien : ![Nom](Image URL)
- Format pour chaque produit dans une liste : ![Nom](image)\n[Nom](url) — Prix`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Groq error:', err);
    return NextResponse.json({ error: 'Erreur IA' }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? '';
  return NextResponse.json({ reply });
}
