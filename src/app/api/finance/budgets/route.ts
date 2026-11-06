import { NextResponse } from 'next/server';
import { getBudgets } from '@/lib/finance/service';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const result = await getBudgets();
  return NextResponse.json(result);
}
