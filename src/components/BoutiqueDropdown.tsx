'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  categories: string[];
}

export default function BoutiqueDropdown({ categories }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/boutique"
        className="text-neutral-600 hover:text-neutral-900 transition-colors uppercase text-sm tracking-widest flex items-center gap-1"
      >
        Boutique
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className="bg-white border border-neutral-100 shadow-xl min-w-[180px] py-2">
            <Link
              href="/boutique"
              className="block px-5 py-2.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Tout voir
            </Link>
            <div className="h-px bg-neutral-100 mx-4 my-1" />
            {categories.map(cat => (
              <Link
                key={cat}
                href={`/boutique?cat=${encodeURIComponent(cat)}`}
                className="block px-5 py-2.5 text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
