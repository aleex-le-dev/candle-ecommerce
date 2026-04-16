import dbConnect from './mongodb';
import OrderModel from './models/Order';
import CounterModel from './models/Counter';

async function nextOrderNumber(): Promise<number> {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: 'orderNumber' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return counter.seq;
}

export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface OrderCustomer {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  cp: string;
  ville: string;
  pays: string;
}

export interface Order {
  _id: string;
  orderNumber: number;
  userId?: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export function formatOrderNumber(n: number): string {
  return String(n).padStart(7, '0');
}

function serialize(doc: any): Order {
  return {
    _id: doc._id.toString(),
    orderNumber: doc.orderNumber ?? 0,
    customer: {
      prenom: doc.customer?.prenom ?? '',
      nom: doc.customer?.nom ?? '',
      email: doc.customer?.email ?? '',
      telephone: doc.customer?.telephone ?? '',
      adresse: doc.customer?.adresse ?? '',
      cp: doc.customer?.cp ?? '',
      ville: doc.customer?.ville ?? '',
      pays: doc.customer?.pays ?? '',
    },
    items: (doc.items ?? []).map((i: any) => ({
      _id: String(i._id),
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image ?? '',
    })),
    subtotal: doc.subtotal,
    discount: doc.discount ?? 0,
    shipping: doc.shipping,
    total: doc.total,
    promoCode: doc.promoCode ?? '',
    status: doc.status ?? 'confirmed',
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt ?? '',
  };
}

export async function getAllOrders(): Promise<Order[]> {
  await dbConnect();
  const docs = await OrderModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(serialize);
}

export async function getOrderById(id: string): Promise<Order | null> {
  await dbConnect();
  const doc = await OrderModel.findById(id).lean();
  return doc ? serialize(doc) : null;
}

export async function createOrder(data: Omit<Order, '_id' | 'createdAt' | 'orderNumber'>): Promise<Order> {
  await dbConnect();
  const orderNumber = await nextOrderNumber();
  const doc = await OrderModel.create({ ...data, orderNumber });
  return serialize(doc);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  await dbConnect();
  const doc = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  return doc ? serialize(doc) : null;
}
