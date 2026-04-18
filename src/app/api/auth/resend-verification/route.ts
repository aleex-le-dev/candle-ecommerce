import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    await dbConnect();
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Toujours répondre OK pour ne pas révéler si l'email existe
    if (!user || user.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.verifyToken = verifyToken;
    await user.save();

    await sendVerificationEmail(email, user.name.split(' ')[0], verifyToken);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Resend error:', err.message);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}
