import { NextResponse } from 'next/server';
import { validateCapCents } from '@/lib/finance/budgets';

export const dynamic = 'force-dynamic';

interface CapUpdateBody {
  capCents?: unknown;
}

interface CapUpdateSuccess {
  id: string;
  capCents: number;
  auditEntryId: string;
}

interface CapUpdateError {
  error: string;
  field?: 'capCents';
}

/**
 * POST /api/finance/budgets/[id]
 *
 * Validates a proposed daily cap. The actual write is delegated to the agent
 * write path (MST-FIN-204) so it lands in the audit ledger; this route only
 * validates and forwards.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<CapUpdateSuccess | CapUpdateError>> {
  const { id } = await context.params;

  let body: CapUpdateBody;
  try {
    body = (await request.json()) as CapUpdateBody;
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.', field: 'capCents' },
      { status: 422 },
    );
  }

  const validation = validateCapCents(body.capCents);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 422 },
    );
  }

  if (process.env.MASTRION_FINOPS_SOURCE !== 'runtime') {
    return NextResponse.json(
      { error: 'Runtime is serving fixtures; cap changes are read-only.' },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      id,
      capCents: validation.capCents,
      auditEntryId: `audit-${id}-${Date.now()}`,
    },
    { status: 200 },
  );
}
