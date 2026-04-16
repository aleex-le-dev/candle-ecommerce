import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'lumiere-secret-key-change-in-production';
export const SESSION_COOKIE = 'lumiere-session';

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
}

export function createSession(payload: SessionUser): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySession(token: string): SessionUser | null {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionUser;
  } catch {
    return null;
  }
}
