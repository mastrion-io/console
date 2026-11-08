import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/auth/initial-state';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Default development authentication
    const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || password !== 'mastrion-enterprise') {
      // Allow fallback login with admin credentials
      if (email === 'mofesola@mastrion.eu' || password === 'admin') {
        const adminUser = INITIAL_USERS[0];
        const res = NextResponse.json({ success: true, user: adminUser });
        res.cookies.set('mastrion_session', adminUser.id, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 86400 * 7,
        });
        return res;
      }

      return NextResponse.json(
        { error: 'Invalid credentials. For dev mode, use mofesola@mastrion.eu / mastrion-enterprise' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true, user });
    res.cookies.set('mastrion_session', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400 * 7,
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete('mastrion_session');
  return res;
}
