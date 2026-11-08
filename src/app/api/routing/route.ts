import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ADMIN_STATE } from '@/lib/models/initial-state';
import { RoutingRule } from '@/lib/models/types';

let rules: RoutingRule[] = [...INITIAL_ADMIN_STATE.routingRules];

export async function GET() {
  return NextResponse.json({
    rules,
    crdSyncStatus: 'synced',
    crdResource: 'networking.mastrion.io/v1alpha1:AIEgressPolicy',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, rule } = body;

    if (action === 'toggle' && body.id) {
      const idx = rules.findIndex((r) => r.id === body.id);
      if (idx !== -1) {
        rules[idx] = { ...rules[idx], enabled: !rules[idx].enabled };
        return NextResponse.json({ success: true, rule: rules[idx] });
      }
    }

    if (action === 'save' && rule) {
      const idx = rules.findIndex((r) => r.id === rule.id);
      if (idx !== -1) {
        rules[idx] = { ...rules[idx], ...rule };
      } else {
        rules.push({
          ...rule,
          id: `rule-${Date.now()}`,
          priority: rules.length + 1,
        });
      }
      return NextResponse.json({ success: true, rules });
    }

    if (action === 'delete' && body.id) {
      rules = rules.filter((r) => r.id !== body.id);
      return NextResponse.json({ success: true, rules });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
