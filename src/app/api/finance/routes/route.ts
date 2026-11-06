import { NextResponse } from 'next/server';
import { getModelRoutes } from '@/lib/finance/service';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const result = await getModelRoutes();
  return NextResponse.json(result);
}
