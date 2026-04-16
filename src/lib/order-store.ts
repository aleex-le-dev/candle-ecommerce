import dbConnect from './mongodb';
import OrderModel from './models/Order';

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

function serialize(doc: any): Order {
  return {
    _id: doc._id.toString(),
    customer: doc.customer,
    items: doc.items,
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

export async function createOrder(data: Omit<Order, '_id' | 'createdAt'>): Promise<Order> {
  await dbConnect();
  const doc = await OrderModel.create(data);
  return serialize(doc);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  await dbConnect();
  const doc = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  return doc ? serialize(doc) : null;
}
