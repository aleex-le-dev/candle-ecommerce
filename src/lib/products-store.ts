import dbConnect from './mongodb';
import ProductModel from './models/Product';

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  details: string;
  variables: { name: string; value: string }[];
  image: string;
  gallery: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
}

function serialize(doc: any): Product {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    price: doc.price,
    description: doc.description ?? '',
    details: doc.details ?? '',
    variables: (doc.variables ?? []).map(({ name, value }: any) => ({ name, value })),
    image: doc.image ?? '',
    gallery: doc.gallery ?? [],
    stock: Number(doc.stock ?? 0),
    featured: doc.featured ?? false,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt ?? '',
  };
}

export async function getAllProducts(): Promise<Product[]> {
  await dbConnect();
  const docs = await ProductModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(serialize);
}

export async function getProductById(id: string): Promise<Product | null> {
  await dbConnect();
  const doc = await ProductModel.findById(id).lean();
  return doc ? serialize(doc) : null;
}

export async function getProductBySlug(categorySlug: string, nameSlug: string): Promise<Product | null> {
  const { slugify } = await import('./slug');
  await dbConnect();
  const docs = await ProductModel.find().lean();
  const doc = docs.find(
    (p: any) => slugify(p.category) === categorySlug && slugify(p.name) === nameSlug
  );
  return doc ? serialize(doc) : null;
}

export async function createProduct(data: Omit<Product, '_id' | 'createdAt'>): Promise<Product> {
  await dbConnect();
  const doc = await ProductModel.create(data);
  return serialize(doc);
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  await dbConnect();
  const doc = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
  return doc ? serialize(doc) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await dbConnect();
  const result = await ProductModel.findByIdAndDelete(id);
  return !!result;
}
