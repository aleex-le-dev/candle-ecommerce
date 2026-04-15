import fs from 'fs';
import path from 'path';

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

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'promos.json');

function ensureDBExists() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllPromos(): PromoCode[] {
  ensureDBExists();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

export function getPromoByCode(code: string): PromoCode | undefined {
  return getAllPromos().find(p => p.code.toUpperCase() === code.toUpperCase().trim());
}

export function createPromo(data: Omit<PromoCode, '_id' | 'createdAt'>): PromoCode {
  const promos = getAllPromos();
  const promo: PromoCode = {
    ...data,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  promos.push(promo);
  fs.writeFileSync(DB_PATH, JSON.stringify(promos, null, 2), 'utf-8');
  return promo;
}

export function updatePromo(id: string, data: Partial<PromoCode>): PromoCode | null {
  const promos = getAllPromos();
  const idx = promos.findIndex(p => p._id === id);
  if (idx === -1) return null;
  promos[idx] = { ...promos[idx], ...data };
  fs.writeFileSync(DB_PATH, JSON.stringify(promos, null, 2), 'utf-8');
  return promos[idx];
}

export function deletePromo(id: string): boolean {
  let promos = getAllPromos();
  const initial = promos.length;
  promos = promos.filter(p => p._id !== id);
  if (promos.length === initial) return false;
  fs.writeFileSync(DB_PATH, JSON.stringify(promos, null, 2), 'utf-8');
  return true;
}

export function validatePromo(code: string, total: number): {
  valid: boolean;
  error?: string;
  discount: number;
  promo?: PromoCode;
} {
  const promo = getPromoByCode(code);
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
