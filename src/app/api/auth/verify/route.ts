import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { createSession, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/compte/verify?status=invalid', req.url));
  }

  try {
    await dbConnect();
    const user = await UserModel.findOne({ verifyToken: token });

    if (!user) {
      return NextResponse.redirect(new URL('/compte/verify?status=invalid', req.url));
    }

    if (user.emailVerified) {
      return NextResponse.redirect(new URL('/compte/verify?status=already', req.url));
    }

    user.emailVerified = true;
    user.verifyToken = '';
    await user.save();

    const session = createSession({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.redirect(new URL('/compte/verify?status=success', req.url));
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;

  } catch (err: any) {
    console.error('Verify error:', err.message);
    return NextResponse.redirect(new URL('/compte/verify?status=error', req.url));
  }
}
