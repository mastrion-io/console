import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/auth/initial-state';
import { User } from '@/lib/auth/types';

let users: User[] = [...INITIAL_USERS];

export async function GET() {
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, user } = body;

    if (action === 'create' && user) {
      const newUser: User = {
        ...user,
        id: `usr-${Date.now()}`,
        status: 'active',
        lastLogin: 'Never',
        apiKeyMasked: `mst_sec_••••••••••••${Math.random().toString(36).substring(2, 6)}`,
      };
      users.push(newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === 'delete' && body.id) {
      users = users.filter((u) => u.id !== body.id);
      return NextResponse.json({ success: true, users });
    }

    if (action === 'update' && user) {
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...user };
        return NextResponse.json({ success: true, user: users[idx] });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error managing users' }, { status: 500 });
  }
}
