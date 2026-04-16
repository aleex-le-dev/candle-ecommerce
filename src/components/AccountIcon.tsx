'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { User } from 'lucide-react';

export default function AccountIcon() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Si connecté : clic direct vers /compte
  if (user) {
    return (
      <Link
        href="/compte"
        className="relative flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
        aria-label="Mon compte"
      >
        <User size={22} strokeWidth={1.5} />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neutral-900" />
      </Link>
    );
  }

  // Si non connecté : petit dropdown connexion / inscription
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
        aria-label="Mon compte"
      >
        <User size={22} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-white border border-neutral-100 shadow-xl z-50 py-2">
          <Link
            href="/compte/connexion"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span className="text-base">🔑</span>
            Se connecter
          </Link>
          <Link
            href="/compte/connexion?mode=register"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span className="text-base">✨</span>
            Créer un compte
          </Link>
        </div>
      )}
    </div>
  );
}
