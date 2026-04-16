'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Connexion() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) window.location.href = '/compte';
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = mode === 'register'
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue');
      } else {
        const redirect = searchParams.get('redirect') || '/compte';
        window.location.href = redirect;
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">
            {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </h1>
          <div className="w-10 h-px bg-neutral-300 mx-auto mt-4" />
        </div>

        {/* Toggle */}
        <div className="flex border border-neutral-200 mb-8">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${
              mode === 'login' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${
              mode === 'register' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Prénom & Nom *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                placeholder="Marie Dupont"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
              placeholder="marie@exemple.fr"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Mot de passe *</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-4 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-8">
          <Link href="/boutique" className="hover:text-neutral-900 underline underline-offset-4 transition-colors">
            Continuer sans compte
          </Link>
        </p>
      </div>
    </div>
  );
}
