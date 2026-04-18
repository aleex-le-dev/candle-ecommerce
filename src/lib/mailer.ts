import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseStyle = `font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #171717;`;
const btnStyle = `display: inline-block; background: #171717; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;`;
const footerStyle = `font-size: 12px; color: #999; margin-top: 32px; line-height: 1.6;`;

function header(name: string, intro: string) {
  return `
    <div style="${baseStyle}">
      <h1 style="font-size: 28px; font-weight: normal; margin-bottom: 8px;">Lumière</h1>
      <div style="width: 40px; height: 1px; background: #ccc; margin-bottom: 32px;"></div>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 8px;">Bonjour ${name},</p>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 32px; color: #555;">${intro}</p>
  `;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: `"Lumière" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Confirmez votre adresse email — Lumière',
    html: `
      ${header(name, 'Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.')}
      <a href="${link}" style="${btnStyle}">Confirmer mon email</a>
      <p style="${footerStyle}">Ce lien est valable 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>`,
  });
}

export async function sendInvoiceEmail(to: string, order: {
  orderNumber: number;
  createdAt: string;
  customer: { prenom: string; nom: string; adresse: string; cp: string; ville: string; pays: string };
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  _id: string;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const num = String(order.orderNumber).padStart(7, '0');
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const eur = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
  const name = `${order.customer.prenom} ${order.customer.nom}`;

  const rows = order.items.map(i => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #333;">${i.name}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #777; text-align: center;">${i.qty}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #777; text-align: right;">${eur(i.price)}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; font-weight: 600; text-align: right;">${eur(i.price * i.qty)}</td>
    </tr>`).join('');

  const totals = `
    <tr><td colspan="3" style="text-align:right;padding:6px 8px;font-size:12px;color:#777;">Sous-total</td><td style="text-align:right;padding:6px 8px;font-size:12px;color:#777;">${eur(order.subtotal)}</td></tr>
    ${order.discount > 0 ? `<tr><td colspan="3" style="text-align:right;padding:6px 8px;font-size:12px;color:#777;">Réduction${order.promoCode ? ` (${order.promoCode})` : ''}</td><td style="text-align:right;padding:6px 8px;font-size:12px;color:#777;">−${eur(order.discount)}</td></tr>` : ''}
    <tr><td colspan="3" style="text-align:right;padding:6px 8px;font-size:12px;color:#777;">Livraison</td><td style="text-align:right;padding:6px 8px;font-size:12px;color:#777;">${order.shipping === 0 ? 'Offerte' : eur(order.shipping)}</td></tr>
    <tr><td colspan="3" style="text-align:right;padding:10px 8px 4px;font-size:14px;font-weight:700;border-top:1px solid #e0e0e0;">Total TTC</td><td style="text-align:right;padding:10px 8px 4px;font-size:14px;font-weight:700;border-top:1px solid #e0e0e0;">${eur(order.total)}</td></tr>`;

  await transporter.sendMail({
    from: `"Lumière" <${process.env.SMTP_USER}>`,
    to,
    subject: `Votre facture Lumière — Commande #${num}`,
    html: `
      ${header(name, `Merci pour votre commande du ${date}. Vous trouverez ci-dessous le récapitulatif de votre commande.`)}

      <div style="background:#f9f9f9;padding:16px;margin-bottom:24px;font-size:12px;color:#777;line-height:1.8;">
        <strong style="color:#333;">Facture N° ${num}</strong> &nbsp;·&nbsp; ${date}<br/>
        ${order.customer.adresse}, ${order.customer.cp} ${order.customer.ville}, ${order.customer.pays}
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="text-align:left;padding:10px 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.05em;">Article</th>
            <th style="text-align:center;padding:10px 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.05em;">Qté</th>
            <th style="text-align:right;padding:10px 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.05em;">P.U.</th>
            <th style="text-align:right;padding:10px 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.05em;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>${totals}</tfoot>
      </table>

      <div style="margin-top:32px;">
        <a href="${base}/facture/${order._id}" style="${btnStyle}" target="_blank">Voir la facture en ligne</a>
      </div>

      <p style="${footerStyle}">Lumière Bougies — TVA non applicable, art. 293 B du CGI<br/>Pour toute question : contact@lumiere-bougies.fr</p>
    </div>`,
  });
}

export async function sendMagicLinkEmail(to: string, name: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/magic?token=${token}`;
  await transporter.sendMail({
    from: `"Lumière" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Votre lien de connexion — Lumière',
    html: `
      ${header(name, 'Cliquez sur le bouton ci-dessous pour vous connecter à votre compte. Ce lien est à usage unique.')}
      <a href="${link}" style="${btnStyle}">Me connecter</a>
      <p style="${footerStyle}">Ce lien expire dans 15 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
    </div>`,
  });
}
