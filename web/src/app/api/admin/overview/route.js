import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getPlans, publicUser } from '@/lib/auth';
import { uncoveredStats } from '@/lib/report';
import { readLevel } from '@/lib/courseData';

// 管理员总览：会员列表（可按手机号搜索）+ 各 Level 的未覆盖题统计
export async function POST(request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return NextResponse.json({ error: '服务端未配置 ADMIN_TOKEN' }, { status: 500 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  if (String(body.token || '') !== adminToken) {
    return NextResponse.json({ error: '管理员密码不正确' }, { status: 403 });
  }

  const search = String(body.search || '').replace(/\D/g, '').slice(0, 11);
  const rows = await query(
    'SELECT id, phone, membership_expires_at, created_at FROM users WHERE phone LIKE $1 ORDER BY created_at DESC LIMIT 200',
    [`%${search}%`]
  );
  const now = Date.now();
  const members = [];
  for (const u of rows) {
    const pub = publicUser(u, await getPlans(u.id));
    members.push({
      phone: u.phone,
      createdAt: u.created_at,
      active: pub.isMember,
      tiers: pub.tiers.map((t) => ({
        tier: t.tier,
        label: t.label,
        active: t.active,
        expiresAt: t.expiresAt,
        daysLeft: t.active ? Math.ceil((new Date(t.expiresAt).getTime() - now) / 86400000) : 0
      }))
    });
  }

  const stats = await uncoveredStats();
  for (const row of stats) {
    const data = await readLevel(row.level);
    row.lessons = data.lessons.map((l) => ({ anchor: l.anchor, title: l.title, count: row.perLesson[l.anchor] || 0 }));
    delete row.perLesson;
  }
  return NextResponse.json({ members, uncovered: stats });
}
