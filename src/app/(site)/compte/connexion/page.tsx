'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Connexion() {
  const { user } = useAuth();
  const redirecting = useRef(false);
  const searchParams = useSearchParams();

  // step: 'email' → 'name' (nouveau compte) → 'sent'
  const [step, setStep] = useState<'email' | 'name' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === 'google' ? 'Connexion Google échouée, réessayez.'
    : searchParams.get('error') === 'magic'  ? 'Lien expiré ou invalide, demandez-en un nouveau.'
    : ''
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !redirecting.current) {
      redirecting.current = true;
      window.location.href = searchParams.get('redirect') || '/compte';
    }
  }, [user]);

  // Étape 1 : vérifier si l'email existe
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 404) {
        // Nouveau compte → demander le nom
        setStep('name');
      } else if (!res.ok) {
        setError(data.error || 'Une erreur est survenue');
      } else {
        // Compte existant → lien envoyé
        setStep('sent');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : créer le compte
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!prenom) { setError('Le prénom est requis'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: [prenom, nom].filter(Boolean).join(' '), email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Une erreur est survenue');
      else setStep('sent');
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white`;

  // ── Écran "email envoyé" ──
  if (step === 'sent') {
    return (
      <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Lumière</h1>
          <div className="w-10 h-px bg-neutral-300 mx-auto mb-10" />
          <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-8 mb-6">
            <div className="text-5xl mb-5">✉</div>
            <h2 className="text-lg font-medium text-neutral-900 mb-3">Vérifiez vos emails</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Un lien vous a été envoyé à <strong>{email}</strong>.<br />
              Cliquez dessus pour accéder à votre compte.
            </p>
            <p className="text-xs text-neutral-400 mt-3">Pensez à vérifier vos spams.</p>
          </div>
          <button onClick={() => { setStep('email'); setError(''); }} className="text-xs text-neutral-400 hover:text-neutral-700 underline underline-offset-4 transition-colors">
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Mon compte</h1>
          <div className="w-10 h-px bg-neutral-300 mx-auto mt-4" />
        </div>

        {/* Google */}
        <a href="/api/auth/google" className="flex items-center justify-center gap-3 w-full border border-neutral-200 py-3.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </a>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400 uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Étape 1 : email */}
        {step === 'email' && (
          <form onSubmit={handleEmail} className="space-y-4" noValidate>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Adresse email *</label>
              <input type="email" required value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                className={inputClass} placeholder="marie@exemple.fr" autoFocus />
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Vérification…' : 'Continuer'}
            </button>
          </form>
        )}

        {/* Étape 2 : nouveau compte → nom */}
        {step === 'name' && (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm text-neutral-600 rounded-sm flex items-center justify-between">
              <span>{email}</span>
              <button type="button" onClick={() => setStep('email')} className="text-xs text-neutral-400 hover:text-neutral-700 underline underline-offset-2">Modifier</button>
            </div>
            <p className="text-sm text-neutral-500">Aucun compte trouvé. Complétez pour créer le vôtre :</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Prénom *</label>
                <input type="text" required value={prenom} onChange={e => { setPrenom(e.target.value); setError(''); }}
                  className={inputClass} placeholder="Marie" autoFocus />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Nom</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} className={inputClass} placeholder="Dupont" />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-neutral-400 mt-8">
          <Link href="/boutique" className="hover:text-neutral-900 underline underline-offset-4 transition-colors">
            Continuer sans compte
          </Link>
        </p>
      </div>
    </div>
  );
}
