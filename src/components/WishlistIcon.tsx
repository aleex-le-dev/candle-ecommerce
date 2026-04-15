'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';

export default function WishlistIcon() {
  const { count } = useWishlist();

  return (
    <Link href="/wishlist" className="text-neutral-600 hover:text-neutral-900 relative">
      <Heart size={24} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
