import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SETUP } from '@/lib/auth/initial-state';
import { SetupConfig } from '@/lib/auth/types';

let setupState: SetupConfig = { ...INITIAL_SETUP };

export async function GET() {
  return NextResponse.json({ setup: setupState });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    setupState = {
      ...setupState,
      ...body,
      completed: true,
      installedAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, setup: setupState });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Setup error' }, { status: 500 });
  }
}
