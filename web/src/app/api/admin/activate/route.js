import { NextResponse } from 'next/server';
import { activatePlan } from '@/lib/auth';
import { TIERS } from '@/lib/plans';

// 按档位开通：L123（1-3级）/ L45 / L67 / L8，每次一个季度（90 天），可重复开通顺延
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
  const tier = String(body.tier || '');
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }
  if (!TIERS[tier]) {
    return NextResponse.json({ error: '请选择要开通的级别档位' }, { status: 400 });
  }
  const result = await activatePlan(phone, tier);
  if (!result) {
    return NextResponse.json({ error: '该手机号尚未注册' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, tier, label: TIERS[tier].label, expiresAt: result.expiresAt });
}
