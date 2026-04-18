import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { createSession, SESSION_COOKIE } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/compte/connexion?error=google', req.url));
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI!;

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('No access token');

    // 2. Get user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();
    const { id: googleId, email, name } = profile;
    if (!email) throw new Error('No email from Google');

    await dbConnect();
    const db = mongoose.connection.db!;
    let user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      // Nouveau compte — envoyer vérification
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const result = await db.collection('users').insertOne({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: '',
        googleId,
        emailVerified: false,
        verifyToken,
        telephone: '',
        adresse: '',
        cp: '',
        ville: '',
        pays: 'France',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await db.collection('users').findOne({ _id: result.insertedId });
      try { await sendVerificationEmail(email, name?.split(' ')[0] || email.split('@')[0], verifyToken); } catch (e) { console.error('Mail error:', e); }
      return NextResponse.redirect(new URL('/compte/verify?status=pending', req.url));
    }

    // Compte existant non vérifié
    if (!user.emailVerified) {
      // Renvoyer un nouveau token de vérification
      const verifyToken = crypto.randomBytes(32).toString('hex');
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { googleId, verifyToken } }
      );
      try { await sendVerificationEmail(email, user.name?.split(' ')[0] || email.split('@')[0], verifyToken); } catch (e) { console.error('Mail error:', e); }
      return NextResponse.redirect(new URL('/compte/verify?status=pending', req.url));
    }

    // Lier Google si pas encore fait
    if (!user.googleId) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { googleId } }
      );
    }

    // Compte vérifié — créer session
    const session = createSession({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.redirect(new URL('/compte', req.url));
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;

  } catch (err: any) {
    console.error('Google OAuth error:', err.message);
    return NextResponse.redirect(new URL('/compte/connexion?error=google', req.url));
  }
}
