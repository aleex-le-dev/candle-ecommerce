import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import ChatWidget from '@/components/ChatWidget';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { AuthProvider } from '@/lib/auth-context';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('lumiere-cart')?.value;
  const wishlistCookie = cookieStore.get('lumiere-wishlist')?.value;
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  let initialCart = [];
  let initialWishlist = [];
  try { if (cartCookie) initialCart = JSON.parse(decodeURIComponent(cartCookie)); } catch {}
  try { if (wishlistCookie) initialWishlist = JSON.parse(decodeURIComponent(wishlistCookie)); } catch {}

  const user = sessionCookie ? verifySession(sessionCookie) : null;

  return (
    <AuthProvider user={user}>
      <CartProvider initialState={initialCart}>
        <WishlistProvider initialState={initialWishlist}>
          <div className="min-h-screen flex flex-col bg-neutral-50">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <ChatWidget />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
