import { NextResponse } from 'next/server';
import { getCostCenter } from '@/lib/finance/service';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const result = await getCostCenter(id);
  if (!result) {
    return NextResponse.json(
      { error: 'cost_center_not_found', id },
      { status: 404 },
    );
  }
  return NextResponse.json(result);
}
