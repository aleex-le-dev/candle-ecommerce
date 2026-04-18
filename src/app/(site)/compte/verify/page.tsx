'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? 'pending';

  const [email, setEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setResendState('loading');
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendState('sent');
    } catch {
      setResendState('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Lumière</h1>
          <div className="w-10 h-px bg-neutral-300 mx-auto mb-10" />
          <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-8 mb-8">
            <div className="text-4xl text-emerald-600 mb-4">✓</div>
            <h2 className="text-lg font-medium text-neutral-900 mb-3">Email confirmé !</h2>
            <p className="text-sm text-neutral-500">Votre compte est activé. Vous êtes maintenant connecté.</p>
          </div>
          <Link href="/compte" className="inline-block bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            Accéder à mon compte
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Lumière</h1>
          <div className="w-10 h-px bg-neutral-300 mx-auto mb-10" />
          <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-8 mb-8">
            <div className="text-4xl text-neutral-600 mb-4">✓</div>
            <h2 className="text-lg font-medium text-neutral-900 mb-3">Déjà confirmé</h2>
            <p className="text-sm text-neutral-500">Votre email a déjà été vérifié.</p>
          </div>
          <Link href="/compte/connexion" className="inline-block bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'invalid' || status === 'error') {
    return (
      <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Lumière</h1>
          <div className="w-10 h-px bg-neutral-300 mx-auto mb-10" />
          <div className="bg-red-50 border border-red-200 rounded-sm p-8 mb-8">
            <div className="text-4xl text-red-500 mb-4">✕</div>
            <h2 className="text-lg font-medium text-neutral-900 mb-3">Lien invalide ou expiré</h2>
            <p className="text-sm text-neutral-500 mb-6">Ce lien de confirmation n&apos;est plus valide. Demandez-en un nouveau.</p>
            <form onSubmit={handleResend} className="text-left space-y-3">
              <input
                type="email"
                required
                placeholder="Votre adresse email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <button type="submit" disabled={resendState === 'loading'} className="w-full bg-neutral-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-60">
                {resendState === 'loading' ? 'Envoi…' : 'Renvoyer le lien'}
              </button>
              {resendState === 'sent' && <p className="text-emerald-600 text-sm text-center">Email envoyé ! Vérifiez votre boîte.</p>}
              {resendState === 'error' && <p className="text-red-500 text-sm text-center">Erreur lors de l&apos;envoi.</p>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // status === 'pending' (default)
  return (
    <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-serif text-neutral-900 mb-2">Lumière</h1>
        <div className="w-10 h-px bg-neutral-300 mx-auto mb-10" />

        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-8 mb-8">
          <div className="text-5xl mb-5">✉</div>
          <h2 className="text-lg font-medium text-neutral-900 mb-3">Vérifiez vos emails</h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-2">
            Un email de confirmation vous a été envoyé.<br />
            Cliquez sur le lien pour activer votre compte.
          </p>
          <p className="text-xs text-neutral-400">Pensez à vérifier vos spams.</p>
        </div>

        <div className="border border-neutral-200 rounded-sm p-6">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Vous n&apos;avez pas reçu l&apos;email ?</p>
          {resendState === 'sent' ? (
            <p className="text-emerald-600 text-sm">✓ Email renvoyé ! Vérifiez votre boîte.</p>
          ) : (
            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Votre adresse email"
                value={email}
                onChange={e => { setEmail(e.target.value); setResendState('idle'); }}
                className="w-full border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <button
                type="submit"
                disabled={resendState === 'loading'}
                className="w-full border border-neutral-900 text-neutral-900 py-3 text-xs uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-60"
              >
                {resendState === 'loading' ? 'Envoi…' : 'Renvoyer l\'email'}
              </button>
              {resendState === 'error' && <p className="text-red-500 text-xs text-center">Erreur lors de l&apos;envoi, réessayez.</p>}
            </form>
          )}
        </div>

        <Link href="/compte/connexion" className="inline-block text-xs text-neutral-400 hover:text-neutral-700 underline underline-offset-4 transition-colors mt-6">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
