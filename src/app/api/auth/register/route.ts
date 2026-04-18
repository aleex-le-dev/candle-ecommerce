import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!name || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });

    await dbConnect();

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await UserModel.create({ name, email, emailVerified: false, verifyToken });

    try { await sendVerificationEmail(email, name.split(' ')[0], verifyToken); } catch (e) { console.error('Mail error:', e); }

    return NextResponse.json({ ok: true, pending: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
