'use client';

import { useState, useRef, useEffect } from 'react';

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let olItems: string[] = [];
  let ulItems: string[] = [];

  const flushOl = () => {
    if (!olItems.length) return;
    elements.push(
      <ol key={elements.length} className="list-decimal list-inside space-y-0.5 my-1">
        {olItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
      </ol>
    );
    olItems = [];
  };
  const flushUl = () => {
    if (!ulItems.length) return;
    elements.push(
      <ul key={elements.length} className="list-disc list-inside space-y-0.5 my-1">
        {ulItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
      </ul>
    );
    ulItems = [];
  };

  for (const line of lines) {
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    if (olMatch) {
      flushUl();
      olItems.push(olMatch[1]);
    } else if (ulMatch) {
      flushOl();
      ulItems.push(ulMatch[1]);
    } else {
      flushOl();
      flushUl();
      if (line.trim()) {
        elements.push(<p key={elements.length}>{parseInline(line)}</p>);
      }
    }
  }
  flushOl();
  flushUl();
  return elements;
}

function parseInline(text: string): React.ReactNode[] {
  // handles ![alt](url), [text](url), **bold**
  const parts = text.split(/(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const img = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) return <img key={i} src={img[2]} alt={img[1]} className="w-full rounded-sm object-cover max-h-36 my-1" />;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={i} href={link[2]} className="underline font-medium hover:opacity-75" target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    return p;
  });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Quels sont vos best-sellers ?',
  'Quels sont vos délais de livraison ?',
  'Avez-vous des codes promo ?',
  'Quelles catégories proposez-vous ?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Bonjour ! Je suis l\'assistant Lumière 🕯️ Comment puis-je vous aider aujourd\'hui ?' }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setInput('');
    const updated: Message[] = [...messages, { role: 'user', content }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Désolé, une erreur est survenue.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Désolé, je rencontre un problème technique. Réessayez dans un instant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={widgetRef}>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-neutral-900 text-white shadow-lg flex items-center justify-center hover:bg-neutral-700 transition-colors"
        aria-label="Chat"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white border border-neutral-200 shadow-2xl flex flex-col" style={{ height: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-900">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">🕯️</div>
            <div>
              <p className="text-sm font-medium text-white">Assistant Lumière</p>
              <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                En ligne · Propulsé par Groq · Llama 3
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <span className="text-base mr-2 mt-0.5 shrink-0">🕯️</span>
                )}
                <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-neutral-900 text-white rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl'
                    : 'bg-neutral-100 text-neutral-800 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl'
                }`}>
                  {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <span className="text-base mr-2">🕯️</span>
                <div className="bg-neutral-100 px-3 py-2 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl">
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            {/* Suggestions — shown only at start */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] border border-neutral-200 text-neutral-600 px-3 py-1.5 hover:bg-neutral-50 hover:border-neutral-400 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-100 px-3 py-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Posez votre question…"
              className="flex-1 text-sm px-3 py-2 border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-700 transition-colors disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
