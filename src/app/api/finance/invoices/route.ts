import { NextResponse } from 'next/server';
import { getInvoices } from '@/lib/finance/service';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const result = await getInvoices();
  return NextResponse.json(result);
}
