import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { createSession, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/compte/connexion?error=magic', req.url));

  try {
    await dbConnect();
    const user = await UserModel.findOne({ loginToken: token });

    if (!user || !user.loginTokenExp || user.loginTokenExp < new Date()) {
      return NextResponse.redirect(new URL('/compte/connexion?error=magic', req.url));
    }

    user.loginToken = '';
    user.loginTokenExp = null;
    await user.save();

    const session = createSession({ userId: user._id.toString(), name: user.name, email: user.email });
    const response = NextResponse.redirect(new URL('/compte', req.url));
    response.cookies.set(SESSION_COOKIE, session, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (err: any) {
    console.error('Magic link error:', err.message);
    return NextResponse.redirect(new URL('/compte/connexion?error=magic', req.url));
  }
}
