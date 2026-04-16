import dbConnect from './mongodb';
import ArticleModel from './models/Article';

export interface Article {
  _id: string;
  theme: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  order: number;
  createdAt: string;
}

function serialize(doc: any): Article {
  return {
    _id: doc._id.toString(),
    theme: doc.theme,
    title: doc.title,
    body: doc.body,
    image: doc.image ?? '',
    imageAlt: doc.imageAlt ?? '',
    order: doc.order ?? 0,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt ?? '',
  };
}

export async function getAllArticles(): Promise<Article[]> {
  await dbConnect();
  const docs = await ArticleModel.find().sort({ order: 1 }).lean();
  return docs.map(serialize);
}

export async function getArticleById(id: string): Promise<Article | null> {
  await dbConnect();
  const doc = await ArticleModel.findById(id).lean();
  return doc ? serialize(doc) : null;
}

export async function createArticle(data: Omit<Article, '_id' | 'createdAt'>): Promise<Article> {
  await dbConnect();
  const doc = await ArticleModel.create(data);
  return serialize(doc);
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  await dbConnect();
  const doc = await ArticleModel.findByIdAndUpdate(id, data, { new: true }).lean();
  return doc ? serialize(doc) : null;
}

export async function deleteArticle(id: string): Promise<boolean> {
  await dbConnect();
  const result = await ArticleModel.findByIdAndDelete(id);
  return !!result;
}
