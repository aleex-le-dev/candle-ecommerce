import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { cookies } from 'next/headers';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('lumiere-cart')?.value;
  const wishlistCookie = cookieStore.get('lumiere-wishlist')?.value;
  
  let initialCart = [];
  let initialWishlist = [];
  try { if (cartCookie) initialCart = JSON.parse(decodeURIComponent(cartCookie)); } catch {}
  try { if (wishlistCookie) initialWishlist = JSON.parse(decodeURIComponent(wishlistCookie)); } catch {}

  return (
    <CartProvider initialState={initialCart}>
      <WishlistProvider initialState={initialWishlist}>
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
