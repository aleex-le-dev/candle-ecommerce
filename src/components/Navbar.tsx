import Link from 'next/link';
import { Menu } from 'lucide-react';
import CartIcon from './CartIcon';
import WishlistIcon from './WishlistIcon';
import AccountIcon from './AccountIcon';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-serif tracking-widest text-neutral-800">LUMIÈRE</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-neutral-600 hover:text-neutral-900 transition-colors uppercase text-sm tracking-widest">Accueil</Link>
            <Link href="/boutique" className="text-neutral-600 hover:text-neutral-900 transition-colors uppercase text-sm tracking-widest">Boutique</Link>
            <Link href="/notre-histoire" className="text-neutral-600 hover:text-neutral-900 transition-colors uppercase text-sm tracking-widest">Notre Histoire</Link>
          </div>
          <div className="flex items-center space-x-4">
            <AccountIcon />
            <WishlistIcon />
            <CartIcon />
            <button className="md:hidden text-neutral-600">
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
