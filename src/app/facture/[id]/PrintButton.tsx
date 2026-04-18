'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 text-sm bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V19a2 2 0 002 2h14a2 2 0 002-2v-2M3 13V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v4" />
      </svg>
      Télécharger en PDF
    </button>
  );
}
