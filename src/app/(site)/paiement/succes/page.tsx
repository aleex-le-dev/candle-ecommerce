'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Suspense } from 'react';

function SuccesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { items, removeItem } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const confirmed = useRef(false);

  useEffect(() => {
    if (!sessionId || confirmed.current) return;
    confirmed.current = true;

    fetch(`/api/stripe/confirm?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.orderNumber) {
          setOrderNumber(data.orderNumber);
          setStatus('success');
          // Vider le panier
          items.forEach(i => removeItem(i._id));
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return (
      <div className="pt-24 pb-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Confirmation du paiement…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pt-24 pb-16 max-w-xl mx-auto px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-2xl font-serif text-neutral-900 mb-4">Une erreur est survenue</h1>
        <p className="text-neutral-500 mb-8">Votre paiement a peut-être été effectué. Contactez-nous si besoin.</p>
        <Link href="/contact" className="inline-block bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">
          Nous contacter
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-xl mx-auto px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-serif text-neutral-900 mb-3">Commande confirmée !</h1>
      {orderNumber && (
        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">
          N° {String(orderNumber).padStart(7, '0')}
        </p>
      )}
      <p className="text-neutral-500 mb-8 max-w-sm">
        Merci pour votre commande. Vous recevrez un email de confirmation dans quelques instants.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        {user && (
          <Link href="/compte?tab=commandes" className="inline-block border border-neutral-900 text-neutral-900 px-8 py-3 uppercase tracking-widest text-sm hover:bg-neutral-900 hover:text-white transition-colors">
            Mes commandes
          </Link>
        )}
        <Link href="/boutique" className="inline-block bg-neutral-900 text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

export default function SuccesPage() {
  return (
    <Suspense fallback={null}>
      <SuccesContent />
    </Suspense>
  );
}
