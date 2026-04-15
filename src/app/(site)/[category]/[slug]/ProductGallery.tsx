'use client';

import { useState } from 'react';

interface Props {
  mainImage: string;
  gallery: string[];
  name: string;
  category: string;
  featured: boolean;
}

export default function ProductGallery({ mainImage, gallery, name, category, featured }: Props) {
  const allImages = [mainImage, ...gallery].filter(Boolean);
  const [selected, setSelected] = useState(mainImage);

  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] bg-neutral-100 overflow-hidden rounded-sm relative group">
        <img
          src={selected}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {featured && (
          <div className="absolute top-4 left-4 bg-neutral-900 text-white text-[10px] uppercase tracking-widest px-3 py-1.5">
            Bestseller
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-700 text-[10px] uppercase tracking-widest px-3 py-1.5">
          {category}
        </div>
      </div>

      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(img)}
              className={`aspect-square overflow-hidden rounded-sm border-2 transition-all duration-200 ${
                selected === img ? 'border-neutral-900' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
