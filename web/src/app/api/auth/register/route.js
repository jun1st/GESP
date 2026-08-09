import { NextResponse } from 'next/server';
import { createUser, findUserByPhone, isValidPhone } from '@/lib/auth';
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

  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }
  if (password.length < 6 || password.length > 32) {
    return NextResponse.json({ error: '密码长度需为 6~32 位' }, { status: 400 });
  }
  if (await findUserByPhone(phone)) {
    return NextResponse.json({ error: '该手机号已注册，请直接登录' }, { status: 409 });
  }

  const user = await createUser(phone, password);
  await createSession(user);
  return NextResponse.json({ ok: true });
}
