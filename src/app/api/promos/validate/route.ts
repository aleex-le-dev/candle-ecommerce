import { NextRequest, NextResponse } from 'next/server';
import { validatePromo } from '@/lib/promo-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') ?? '';
  const total = parseFloat(searchParams.get('total') ?? '0');

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Code manquant', discount: 0 }, { status: 400 });
  }

  const result = await validatePromo(code, total);
  return NextResponse.json(result);
}
