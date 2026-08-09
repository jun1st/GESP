import { NextResponse } from 'next/server';
import { activateMembership } from '@/lib/auth';

export async function POST(request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: '服务端未配置 ADMIN_TOKEN' }, { status: 500 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  if (String(body.token || '') !== adminToken) {
    return NextResponse.json({ error: '管理员密码不正确' }, { status: 403 });
  }
  const phone = String(body.phone || '').trim();
  const months = Math.min(Math.max(Number(body.months) || 12, 1), 120);
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }
  const user = await activateMembership(phone, months);
  if (!user) {
    return NextResponse.json({ error: '该手机号尚未注册' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, expiresAt: user.membership_expires_at });
}
