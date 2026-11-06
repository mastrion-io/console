import { NextResponse } from 'next/server';
import { getCostCenters } from '@/lib/finance/service';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const result = await getCostCenters();
  return NextResponse.json(result);
}
