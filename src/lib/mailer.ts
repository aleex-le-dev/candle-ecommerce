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
