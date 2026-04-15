export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^a-z0-9]+/g, '-')     // remplace tout ce qui n'est pas alphanumérique
    .replace(/^-+|-+$/g, '');        // supprime les tirets en début/fin
}

export function productUrl(category: string, name: string): string {
  return `/${slugify(category)}/${slugify(name)}`;
}
