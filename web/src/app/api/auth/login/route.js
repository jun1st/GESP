import { NextResponse } from 'next/server';
import { findUserByPhone, verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  const phone = String(body.phone || '').trim();
  const password = String(body.password || '');

  const user = await findUserByPhone(phone);
  if (!user || !(await verifyPassword(user, password))) {
    return NextResponse.json({ error: '手机号或密码不正确' }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ ok: true });
}
