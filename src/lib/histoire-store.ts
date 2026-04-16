import fs from 'fs';
import path from 'path';

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

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'histoire.json');

function ensureDBExists() {
  if (!fs.existsSync(DB_PATH)) {
    const defaults: Article[] = [
      {
        _id: '1',
        theme: 'Les Origines',
        title: 'Un atelier provençal, une passion',
        body: "Tout a commencé dans un petit atelier en Provence, où notre fondatrice a appris l'art de la bougie auprès d'artisans locaux. Fascinée par la transformation de la cire et des huiles essentielles en objets de beauté, elle a voulu partager cette magie avec le plus grand nombre. Chaque bougie Lumière est coulée à la main, en petites séries, pour garantir une qualité irréprochable et un soin particulier porté à chaque détail.",
        image: 'https://images.unsplash.com/photo-1616858004746-860e68e43827?q=80&w=1200',
        imageAlt: 'Atelier Lumière',
        order: 0,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        theme: 'Notre Philosophie',
        title: 'Le naturel avant tout',
        body: "Nous utilisons exclusivement des cires végétales — soja, coco, colza — et des parfums développés par des nez de Grasse. Aucun composé chimique nocif, aucun paraben, aucune paraffine. Nos mèches en coton brûlent doucement et proprement, libérant les senteurs sans noircir vos murs ni polluer votre intérieur.",
        image: 'https://images.unsplash.com/photo-1582239459521-8ff819c9e54a?q=80&w=1200',
        imageAlt: 'Ingrédients naturels',
        order: 1,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
  }
}

export function getAllArticles(): Article[] {
  ensureDBExists();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const articles: Article[] = JSON.parse(raw);
  return articles.sort((a, b) => a.order - b.order);
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a._id === id);
}

export function createArticle(data: Omit<Article, '_id' | 'createdAt'>): Article {
  const articles = getAllArticles();
  const newArticle: Article = {
    ...data,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  articles.push(newArticle);
  fs.writeFileSync(DB_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  return newArticle;
}

export function updateArticle(id: string, data: Partial<Article>): Article | null {
  const articles = getAllArticles();
  const idx = articles.findIndex((a) => a._id === id);
  if (idx === -1) return null;
  articles[idx] = { ...articles[idx], ...data };
  fs.writeFileSync(DB_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  return articles[idx];
}

export function deleteArticle(id: string): boolean {
  let articles = getAllArticles();
  const initial = articles.length;
  articles = articles.filter((a) => a._id !== id);
  if (articles.length === initial) return false;
  fs.writeFileSync(DB_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  return true;
}
