import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findUserByPhone, publicUser } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  const user = await findUserByPhone(session.phone);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: publicUser(user) });
}
