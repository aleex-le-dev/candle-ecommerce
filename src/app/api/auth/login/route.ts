import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { sendMagicLinkEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    await dbConnect();
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'Aucun compte associé à cet email. Créez un compte ou connectez-vous via Google.', field: 'email' }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Email non vérifié. Vérifiez votre boîte mail ou renvoyez le lien de confirmation.', field: 'email', unverified: true }, { status: 403 });
    }

    const loginToken = crypto.randomBytes(32).toString('hex');
    const loginTokenExp = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    user.loginToken = loginToken;
    user.loginTokenExp = loginTokenExp;
    await user.save();

    try { await sendMagicLinkEmail(email, user.name.split(' ')[0], loginToken); } catch (e) { console.error('Mail error:', e); }

    return NextResponse.json({ ok: true, pending: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
