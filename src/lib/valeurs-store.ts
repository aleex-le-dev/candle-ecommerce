import dbConnect from './mongodb';
import ValeurModel from './models/Valeur';

export interface Valeur {
  _id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
  createdAt: string;
}

function serialize(doc: any): Valeur {
  return {
    _id: doc._id.toString(),
    icon: doc.icon ?? '',
    title: doc.title,
    desc: doc.desc,
    order: doc.order ?? 0,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt ?? '',
  };
}

export async function getAllValeurs(): Promise<Valeur[]> {
  await dbConnect();
  const docs = await ValeurModel.find().sort({ order: 1 }).lean();
  return docs.map(serialize);
}

export async function getValeurById(id: string): Promise<Valeur | null> {
  await dbConnect();
  const doc = await ValeurModel.findById(id).lean();
  return doc ? serialize(doc) : null;
}

export async function createValeur(data: Omit<Valeur, '_id' | 'createdAt'>): Promise<Valeur> {
  await dbConnect();
  const doc = await ValeurModel.create(data);
  return serialize(doc);
}

export async function updateValeur(id: string, data: Partial<Valeur>): Promise<Valeur | null> {
  await dbConnect();
  const doc = await ValeurModel.findByIdAndUpdate(id, data, { new: true }).lean();
  return doc ? serialize(doc) : null;
}

export async function deleteValeur(id: string): Promise<boolean> {
  await dbConnect();
  const result = await ValeurModel.findByIdAndDelete(id);
  return !!result;
}
