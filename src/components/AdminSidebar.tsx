'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Counts { products: number; promos: number; histoire: number; valeurs: number; categories: number; }

export default function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    fetch('/api/admin/counts').then(r => r.json()).then(d => { if (!d.error) setCounts(d); });
  }, []);

  const active = (path: string) => pathname === path || (path !== '/admin' && pathname.startsWith(path));

  const item = (href: string, label: string, icon: React.ReactNode, count?: number, plusHref?: string) => (
    <div className="flex items-center gap-1">
      <a
        href={href}
        className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
          active(href)
            ? 'bg-[var(--adm-surface-lg)] text-[var(--adm-text)]'
            : 'text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)]'
        }`}
      >
        {icon}
        {label}
        {counts != null && count !== undefined && (
          <span className="ml-auto text-xs bg-[var(--adm-surface-lg)] px-2 py-0.5 rounded-full">{count}</span>
        )}
      </a>
      {plusHref && (
        <a
          href={plusHref}
          title={`Nouveau(lle) ${label}`}
          className="p-2 rounded-xl text-[var(--adm-text-40)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-surface)] transition-all text-lg leading-none"
        >+</a>
      )}
    </div>
  );

  return (
    <aside className="w-64 border-r border-[var(--adm-border)] flex flex-col bg-[var(--adm-sidebar)] flex-shrink-0">
      <div className="p-6 border-b border-[var(--adm-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-black font-bold text-sm">L</span>
          </div>
          <div>
            <p className="text-[var(--adm-text)] font-semibold text-sm">Lumière</p>
            <p className="text-[var(--adm-text-30)] text-xs">Administration</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-1">Catalogue</p>

        {item('/admin', 'Produits',
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
          counts?.products, '/admin?new=1'
        )}

        {item('/admin/categories', 'Catégories',
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
          counts?.categories, '/admin/categories'
        )}

        <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-4">Marketing</p>

        {item('/admin/promos', 'Codes promo',
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
          counts?.promos, '/admin/promos?new=1'
        )}

        <p className="text-[10px] uppercase tracking-widest text-[var(--adm-text-20)] px-4 pb-2 pt-4">Contenu</p>

        {item('/admin/histoire', 'Notre Histoire',
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
          counts?.histoire, '/admin/histoire?new=1'
        )}

        {item('/admin/valeurs', 'Nos Valeurs',
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
          counts?.valeurs, '/admin/valeurs?new=1'
        )}
      </div>
    </aside>
  );
}
