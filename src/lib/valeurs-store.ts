import fs from 'fs';
import path from 'path';

export interface Valeur {
  _id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'valeurs.json');

function ensureDBExists() {
  if (!fs.existsSync(DB_PATH)) {
    const defaults: Valeur[] = [
      {
        _id: '1',
        icon: '🌿',
        title: 'Naturel',
        desc: 'Matières premières sélectionnées pour leur origine naturelle et leur qualité.',
        order: 0,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        icon: '🤲',
        title: 'Artisanal',
        desc: 'Chaque bougie est coulée et assemblée à la main dans notre atelier.',
        order: 1,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        icon: '♻️',
        title: 'Durable',
        desc: 'Pots en verre réutilisables, emballages recyclés, impact minimal.',
        order: 2,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
  }
}

export function getAllValeurs(): Valeur[] {
  ensureDBExists();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const valeurs: Valeur[] = JSON.parse(raw);
  return valeurs.sort((a, b) => a.order - b.order);
}

export function getValeurById(id: string): Valeur | undefined {
  return getAllValeurs().find((v) => v._id === id);
}

export function createValeur(data: Omit<Valeur, '_id' | 'createdAt'>): Valeur {
  const valeurs = getAllValeurs();
  const newValeur: Valeur = {
    ...data,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  valeurs.push(newValeur);
  fs.writeFileSync(DB_PATH, JSON.stringify(valeurs, null, 2), 'utf-8');
  return newValeur;
}

export function updateValeur(id: string, data: Partial<Valeur>): Valeur | null {
  const valeurs = getAllValeurs();
  const idx = valeurs.findIndex((v) => v._id === id);
  if (idx === -1) return null;
  valeurs[idx] = { ...valeurs[idx], ...data };
  fs.writeFileSync(DB_PATH, JSON.stringify(valeurs, null, 2), 'utf-8');
  return valeurs[idx];
}

export function deleteValeur(id: string): boolean {
  let valeurs = getAllValeurs();
  const initial = valeurs.length;
  valeurs = valeurs.filter((v) => v._id !== id);
  if (valeurs.length === initial) return false;
  fs.writeFileSync(DB_PATH, JSON.stringify(valeurs, null, 2), 'utf-8');
  return true;
}
