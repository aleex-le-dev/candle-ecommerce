import fs from 'fs';
import path from 'path';
import { slugify } from './slug';

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  details: string;
  burnTime: string;
  weight: string;
  image: string;
  gallery: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'products.json');

function ensureDBExists() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultProducts: Product[] = [
      {
        _id: '1',
        name: 'Fleur de Lavande',
        category: 'Florale',
        price: 24,
        description: 'Une bougie apaisante aux huiles essentielles de lavande, idéale pour se détendre après une longue journée.',
        details: '100% cire de soja naturelle, mèche en coton sans plomb. Coulée à la main en Provence.',
        burnTime: '40h',
        weight: '180g',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1616858004746-860e68e43827?q=80&w=1200',
          'https://images.unsplash.com/photo-1609145695078-d4501a3512b9?q=80&w=1200',
        ],
        stock: 15,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'Vanille Bourbon',
        category: 'Gourmande',
        price: 26,
        description: 'Un parfum chaud et réconfortant de vanille douce avec de légères notes boisées et ambrées.',
        details: '100% cire de coco et soja, parfum de Grasse. Durée de combustion estimée à 45 heures.',
        burnTime: '45h',
        weight: '200g',
        image: 'https://images.unsplash.com/photo-1605814510527-2cdd652d9198?q=80&w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1608248593339-b90306132717?q=80&w=1200',
          'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=1200',
        ],
        stock: 8,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        name: 'Bois de Cèdre',
        category: 'Boisée',
        price: 28,
        description: 'Une fragrance boisée et chaleureuse pour une ambiance chalet rustique et élégante.',
        details: 'Mélange exclusif de cires végétales. Notes de tête : Bergamote, Notes de cœur : Cèdre, Notes de fond : Vétiver.',
        burnTime: '50h',
        weight: '220g',
        image: 'https://images.unsplash.com/photo-1596433809252-260c27459eb0?q=80&w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1200',
          'https://images.unsplash.com/photo-1620600120150-1d8f1e28cdd2?q=80&w=1200',
        ],
        stock: 20,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '4',
        name: 'Ambre Doux',
        category: 'Orientale',
        price: 25,
        description: "Une lueur douce et un parfum sensuel d'ambre exotique avec une touche de musc et de fève tonka.",
        details: "Cire d'abeille et soja. Pot en verre ambré réutilisable. Temps de combustion : 50h.",
        burnTime: '50h',
        weight: '200g',
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1603006905393-cfbf06fa6bdf?q=80&w=1200',
          'https://images.unsplash.com/photo-1610427357416-d86b72a6b251?q=80&w=1200',
        ],
        stock: 12,
        featured: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '5',
        name: "Fleur d'Oranger",
        category: 'Florale',
        price: 27,
        description: "Une invitation au voyage au cœur d'un verger en fleurs avec ce parfum subtil et légèrement sucré.",
        details: 'Cire végétale sans OGM, sans phtalates. Mèche 100% coton.',
        burnTime: '45h',
        weight: '180g',
        image: 'https://images.unsplash.com/photo-1582239459521-8ff819c9e54a?q=80&w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1555526015-89f5c225018f?q=80&w=1200',
          'https://images.unsplash.com/photo-1602484501258-39c4a8ee9278?q=80&w=1200',
        ],
        stock: 6,
        featured: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '6',
        name: 'Rose & Pivoine',
        category: 'Florale',
        price: 29,
        description: "L'élégance intemporelle de la rose associée à la délicatesse de la pivoine pour une touche florale.",
        details: 'Bougie naturelle coulée à la main. Notes florales intenses. 180g net.',
        burnTime: '50h',
        weight: '180g',
        image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1572454652253-ab021efcd672?q=80&w=1200',
          'https://images.unsplash.com/photo-1579213838826-eb5bc2052b66?q=80&w=1200',
        ],
        stock: 10,
        featured: false,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultProducts, null, 2), 'utf-8');
  }
}

export function getAllProducts(): Product[] {
  ensureDBExists();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p._id === id);
}

export function getProductBySlug(categorySlug: string, nameSlug: string): Product | undefined {
  return getAllProducts().find(
    (p) => slugify(p.category) === categorySlug && slugify(p.name) === nameSlug
  );
}

export function createProduct(data: Omit<Product, '_id' | 'createdAt'>): Product {
  const products = getAllProducts();
  const newProduct: Product = {
    ...data,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  let products = getAllProducts();
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  let products = getAllProducts();
  const initial = products.length;
  products = products.filter((p) => p._id !== id);
  if (products.length === initial) return false;
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
  return true;
}
