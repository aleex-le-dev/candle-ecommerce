import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-neutral-50">
          <Navbar />
          <main className="flex-grow">
          {children}
          </main>
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
