'use client';

import { useState, useEffect } from 'react';
import { getConsent, acceptAll, refuseAll, saveConsent, type CookieConsent } from '@/lib/cookies-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [panel, setPanel] = useState<'banner' | 'customize'>('banner');
  const [prefs, setPrefs] = useState<CookieConsent>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => { acceptAll(); setVisible(false); };
  const handleRefuseAll = () => { refuseAll(); setVisible(false); };
  const handleSave = () => { saveConsent(prefs); setVisible(false); };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white border border-neutral-200 shadow-2xl">

        {panel === 'banner' && (
          <div className="p-6">
            <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Cookies</p>
            <h2 className="text-base font-medium text-neutral-900 mb-2">Nous utilisons des cookies</h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Nous utilisons des cookies essentiels au fonctionnement du site. Avec votre accord, nous pouvons également utiliser des cookies analytiques et marketing pour améliorer votre expérience.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleAcceptAll} className="flex-1 min-w-[140px] bg-neutral-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                Tout accepter
              </button>
              <button onClick={handleRefuseAll} className="flex-1 min-w-[140px] border border-neutral-200 text-neutral-700 py-3 text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                Tout refuser
              </button>
              <button onClick={() => setPanel('customize')} className="flex-1 min-w-[140px] border border-neutral-200 text-neutral-500 py-3 text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                Personnaliser
              </button>
            </div>
          </div>
        )}

        {panel === 'customize' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setPanel('banner')} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-base font-medium text-neutral-900">Personnaliser les cookies</h2>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { key: 'essential', label: 'Essentiels', desc: 'Authentification, panier, session. Nécessaires au fonctionnement du site.', locked: true },
                { key: 'analytics', label: 'Analytiques', desc: 'Mesure d\'audience et statistiques de navigation anonymisées.', locked: false },
                { key: 'marketing', label: 'Marketing', desc: 'Personnalisation des publicités et suivi des conversions.', locked: false },
              ].map(({ key, label, desc, locked }) => (
                <div key={key} className="flex items-center gap-4 py-4 border-b border-neutral-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 mb-1">{label}</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">{desc}</p>
                  </div>
                  {locked ? (
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-200 px-2 py-1 whitespace-nowrap">
                      Toujours actif
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrefs(p => ({ ...p, [key]: !p[key as keyof CookieConsent] }))}
                      className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${prefs[key as keyof CookieConsent] ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                    >
                      <span className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[key as keyof CookieConsent] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={handleSave} className="w-full bg-neutral-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">
              Enregistrer mes préférences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
