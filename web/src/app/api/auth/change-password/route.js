import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  const oldPassword = String(body.oldPassword || '');
  const newPassword = String(body.newPassword || '');
  if (newPassword.length < 6 || newPassword.length > 32) {
    return NextResponse.json({ error: '新密码长度需为 6~32 位' }, { status: 400 });
  }

  const rows = await query('SELECT password_hash FROM users WHERE id = $1', [session.id]);
  const user = rows[0];
  if (!user || !(await verifyPassword(user, oldPassword))) {
    return NextResponse.json({ error: '原密码不正确' }, { status: 401 });
  }
  const bcrypt = (await import('bcryptjs')).default;
  const hash = await bcrypt.hash(newPassword, 10);
  await run('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, session.id]);
  return NextResponse.json({ ok: true });
}
