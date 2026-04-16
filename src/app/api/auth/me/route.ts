import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ user: null });

  await dbConnect();
  const dbUser = await mongoose.connection.db!
    .collection('users')
    .findOne({ _id: new mongoose.Types.ObjectId(session.userId) }) as any;
  if (!dbUser) return NextResponse.json({ user: null });

  const orders = await OrderModel.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    user: {
      userId: session.userId,
      name: dbUser.name,
      email: dbUser.email,
      telephone: dbUser.telephone ?? '',
      adresse: dbUser.adresse ?? '',
      cp: dbUser.cp ?? '',
      ville: dbUser.ville ?? '',
      pays: dbUser.pays ?? 'France',
    },
    orders: orders.map((o: any) => ({
      _id: o._id.toString(),
      createdAt: o.createdAt,
      status: o.status,
      total: o.total,
      items: o.items,
    })),
  });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { prenom, nom, email, telephone, adresse, cp, ville, pays } = await req.json();

  await dbConnect();

  const $set: Record<string, string> = {
    telephone: telephone ?? '',
    adresse:   adresse   ?? '',
    cp:        cp        ?? '',
    ville:     ville     ?? '',
    pays:      pays      ?? 'France',
  };
  if (prenom !== undefined || nom !== undefined) {
    $set.name = [prenom, nom].filter(Boolean).join(' ');
  }
  if (email) $set.email = email.toLowerCase().trim();

  // Utilise le driver natif pour éviter le mode strict Mongoose
  const result = await mongoose.connection.db!
    .collection('users')
    .findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(session.userId) },
      { $set },
      { returnDocument: 'after' }
    );

  if (!result) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
