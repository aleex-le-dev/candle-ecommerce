import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import OrderModel from '@/lib/models/Order';
import CompteClient from './CompteClient';

export const dynamic = 'force-dynamic';

export default async function ComptePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) redirect('/compte/connexion');

  await dbConnect();

  // Utilise le driver natif pour éviter le cache de schema Mongoose
  const dbUser = await mongoose.connection.db!
    .collection('users')
    .findOne({ _id: new mongoose.Types.ObjectId(session.userId) }) as any;

  if (!dbUser) redirect('/compte/connexion');

  const rawOrders = await OrderModel.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();

  const orders = rawOrders.map((o: any) => ({
    _id: o._id.toString(),
    orderNumber: o.orderNumber ?? 0,
    createdAt: o.createdAt?.toISOString?.() ?? '',
    status: o.status as string,
    total: o.total as number,
    items: (o.items ?? []).map((i: any) => ({
      _id: String(i._id),
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image ?? '',
    })),
  }));

  const user = {
    userId: session.userId,
    name:      (dbUser.name      ?? '') as string,
    email:     (dbUser.email     ?? '') as string,
    telephone: (dbUser.telephone ?? '') as string,
    adresse:   (dbUser.adresse   ?? '') as string,
    cp:        (dbUser.cp        ?? '') as string,
    ville:     (dbUser.ville     ?? '') as string,
    pays:      (dbUser.pays      ?? 'France') as string,
  };

  return <CompteClient user={user} orders={orders} />;
}
