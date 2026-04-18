import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { getOrderById } from '@/lib/order-store';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DARK   = rgb(0.07, 0.09, 0.15);
const GREY   = rgb(0.61, 0.64, 0.69);
const LGREY  = rgb(0.91, 0.92, 0.93);
const ACCENT = rgb(0.42, 0.45, 0.50);
const WHITE  = rgb(1, 1, 1);

function eur(n: number) {
  return n.toFixed(2).replace('.', ',') + ' \u20AC';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  if (order.userId && order.userId !== session.userId)
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const doc   = await PDFDocument.create();
  const page  = doc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const bold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  const L = 50;           // left margin
  const R = width - 50;   // right margin
  const W = R - L;        // usable width

  // helper: draw text (pdf-lib origin = bottom-left)
  const text = (
    str: string,
    x: number,
    y: number,
    { font = regular, size = 10, color = DARK, align = 'left' as 'left'|'right'|'center', maxWidth = W }: {
      font?: typeof bold; size?: number; color?: typeof DARK; align?: 'left'|'right'|'center'; maxWidth?: number;
    } = {}
  ) => {
    const tw = font.widthOfTextAtSize(str, size);
    let dx = x;
    if (align === 'right')  dx = x - tw;                    // x = bord droit
    if (align === 'center') dx = x + (maxWidth - tw) / 2;   // x = bord gauche du conteneur
    page.drawText(str, { x: Math.max(L, dx), y, font, size, color });
  };

  const line = (x1: number, y1: number, x2: number, y2: number, color = LGREY) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.5, color });

  // ── En-tête ────────────────────────────────────────────────
  const HT = height - 60;
  text('Lumière', L, HT, { font: bold, size: 22 });
  text('Bougies artisanales naturelles', L, HT - 18, { size: 9, color: GREY });
  text('contact@lumiere-bougies.fr',     L, HT - 30, { size: 9, color: GREY });

  text('FACTURE', R, HT, { font: bold, size: 24, align: 'right' });
  const orderNum = 'N\u00B0 ' + String(order.orderNumber).padStart(7, '0');
  text(orderNum, R, HT - 20, { size: 10, color: ACCENT, align: 'right' });
  const dateStr = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  text('Date : ' + dateStr, R, HT - 34, { size: 9, color: ACCENT, align: 'right' });

  line(L, HT - 48, R, HT - 48);

  // ── Adresse client ─────────────────────────────────────────
  let cy = HT - 68;
  text('FACTURÉ À', L, cy, { font: bold, size: 7, color: GREY });
  cy -= 14;
  text(`${order.customer.prenom} ${order.customer.nom}`, L, cy, { font: bold, size: 11 });
  cy -= 15;
  if (order.customer.adresse) { text(order.customer.adresse, L, cy, { size: 9, color: ACCENT }); cy -= 13; }
  const cpVille = [order.customer.cp, order.customer.ville].filter(Boolean).join(' ');
  if (cpVille) { text(cpVille, L, cy, { size: 9, color: ACCENT }); cy -= 13; }
  if (order.customer.pays) { text(order.customer.pays, L, cy, { size: 9, color: ACCENT }); cy -= 13; }
  text(order.customer.email, L, cy, { size: 9, color: ACCENT }); cy -= 13;

  // ── Tableau articles ───────────────────────────────────────
  // Bords droits de chaque colonne (right-aligned)
  const tableTop  = cy - 20;
  const C_QTE     = L + 310;   // bord droit colonne QTÉ
  const C_PU      = L + 390;   // bord droit colonne P.U.
  const C_TOT     = R;         // bord droit colonne TOTAL (= 545)
  const DESC_MAX  = C_QTE - L - 14; // largeur max texte description

  // En-tête tableau
  page.drawRectangle({ x: L, y: tableTop - 6, width: W, height: 20, color: LGREY });
  text('DÉSIGNATION', L + 6,  tableTop + 7, { font: bold, size: 8, color: GREY });
  text('QTÉ',         C_QTE,  tableTop + 7, { font: bold, size: 8, color: GREY, align: 'right' });
  text('P.U.',        C_PU,   tableTop + 7, { font: bold, size: 8, color: GREY, align: 'right' });
  text('TOTAL',       C_TOT,  tableTop + 7, { font: bold, size: 8, color: GREY, align: 'right' });

  let ry = tableTop - 10;
  for (const item of order.items) {
    const lineTotal = item.price * item.qty;
    // Tronquer le nom si trop long
    let name = item.name;
    while (name.length > 1 && regular.widthOfTextAtSize(name, 10) > DESC_MAX) {
      name = name.slice(0, -1);
    }
    if (name !== item.name) name = name.slice(0, -1) + '…';

    text(name,             L + 6,  ry, { size: 10 });
    text(String(item.qty), C_QTE,  ry, { size: 10, color: ACCENT, align: 'right' });
    text(eur(item.price),  C_PU,   ry, { size: 10, color: ACCENT, align: 'right' });
    text(eur(lineTotal),   C_TOT,  ry, { size: 10, align: 'right' });
    ry -= 6;
    line(L, ry, R, ry);
    ry -= 14;
  }

  // ── Totaux ─────────────────────────────────────────────────
  const TX = C_PU - 100;  // début des labels (aligné sous P.U.)
  const TV = R;
  let ty = ry - 10;

  const totLine = (label: string, value: string, isBold = false) => {
    const f = isBold ? bold : regular;
    const c = isBold ? DARK : ACCENT;
    text(label, TX, ty, { font: f, size: isBold ? 11 : 10, color: c });
    text(value, TV, ty, { font: f, size: isBold ? 11 : 10, color: c, align: 'right' });
    ty -= isBold ? 20 : 16;
  };

  totLine('Sous-total', eur(order.subtotal));
  if (order.discount > 0) totLine('Réduction', '−' + eur(order.discount));
  totLine('Livraison', order.shipping === 0 ? 'Offerte' : eur(order.shipping));
  line(TX, ty + 8, R, ty + 8);
  ty -= 4;
  totLine('Total TTC', eur(order.total), true);

  if (order.promoCode) {
    text('Code promo appliqué : ' + order.promoCode, L, ty - 6, { size: 8, color: GREY });
  }

  // ── Pied de page ──────────────────────────────────────────
  line(L, 50, R, 50);
  text(
    'Lumière Bougies — TVA non applicable, art. 293 B du CGI — Merci pour votre commande !',
    L, 36, { size: 8, color: GREY, align: 'center', maxWidth: W }
  );

  const pdfBytes = await doc.save();
  const filename = `facture-${String(order.orderNumber).padStart(7, '0')}.pdf`;

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBytes.length),
    },
  });
}
