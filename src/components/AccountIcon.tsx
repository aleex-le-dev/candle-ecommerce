'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { User } from 'lucide-react';

export default function AccountIcon() {
  const { user } = useAuth();

  if (user) {
    return (
      <Link href="/compte" className="relative flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors" aria-label="Mon compte">
        <User size={22} strokeWidth={1.5} />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neutral-900" />
      </Link>
    );
  }

  return (
    <Link href="/compte/connexion" className="flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors" aria-label="Mon compte">
      <User size={22} strokeWidth={1.5} />
    </Link>
  );
}
