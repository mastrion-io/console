import { NextResponse } from 'next/server';
import { getKpis } from '@/lib/finance/service';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const result = await getKpis();
  return NextResponse.json(result);
}
