import dbConnect from './mongodb';
import PromoModel from './models/Promo';

export interface PromoCode {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

function serialize(doc: any): PromoCode {
  return {
    _id: doc._id.toString(),
    code: doc.code,
    type: doc.type,
    value: doc.value,
    minOrder: doc.minOrder ?? 0,
    active: doc.active ?? true,
    expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : undefined,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt ?? '',
  };
}

export async function getAllPromos(): Promise<PromoCode[]> {
  await dbConnect();
  const docs = await PromoModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(serialize);
}

export async function getPromoByCode(code: string): Promise<PromoCode | null> {
  await dbConnect();
  const doc = await PromoModel.findOne({ code: code.toUpperCase().trim() }).lean();
  return doc ? serialize(doc) : null;
}

export async function createPromo(data: Omit<PromoCode, '_id' | 'createdAt'>): Promise<PromoCode> {
  await dbConnect();
  const doc = await PromoModel.create(data);
  return serialize(doc);
}

export async function updatePromo(id: string, data: Partial<PromoCode>): Promise<PromoCode | null> {
  await dbConnect();
  const doc = await PromoModel.findByIdAndUpdate(id, data, { new: true }).lean();
  return doc ? serialize(doc) : null;
}

export async function deletePromo(id: string): Promise<boolean> {
  await dbConnect();
  const result = await PromoModel.findByIdAndDelete(id);
  return !!result;
}

export async function validatePromo(code: string, total: number): Promise<{
  valid: boolean;
  error?: string;
  discount: number;
  promo?: PromoCode;
}> {
  const promo = await getPromoByCode(code);
  if (!promo) return { valid: false, error: 'Code introuvable', discount: 0 };
  if (!promo.active) return { valid: false, error: 'Code inactif', discount: 0 };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, error: 'Code expiré', discount: 0 };
  }
  if (total < promo.minOrder) {
    return { valid: false, error: `Commande minimum ${promo.minOrder.toFixed(2)} € requis`, discount: 0 };
  }
  const discount = promo.type === 'percent'
    ? Math.round(total * promo.value) / 100
    : Math.min(promo.value, total);
  return { valid: true, discount, promo };
}
