'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartIcon() {
  const { count } = useCart();

  return (
    <Link href="/panier" className="text-neutral-600 hover:text-neutral-900 relative">
      <ShoppingBag size={24} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
