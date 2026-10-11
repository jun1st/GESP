import { NextResponse } from 'next/server';
import { getMemberContext } from '@/lib/member';
import { query, run } from '@/lib/db';
import { isCloudKey } from '@/lib/syncKeys';

async function guard() {
  const { user, isMember } = await getMemberContext();
  if (!user) return { error: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  if (!isMember) return { error: NextResponse.json({ error: '会员专享' }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  const { user } = g;
  const rows = await query('SELECT key, value FROM user_data WHERE user_id = $1', [user.id]);
  const data = {};
  for (const row of rows) {
    data[row.key] = row.value;
  }
  return NextResponse.json({ data });
}

export async function POST(request) {
  const g = await guard();
  if (g.error) return g.error;
  const { user } = g;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  const items = Array.isArray(body.items)
    ? body.items
    : [{ key: body.key, value: body.value }];
  const now = new Date().toISOString();
  for (const item of items) {
    const key = String(item.key || '');
    if (!isCloudKey(key)) {
      return NextResponse.json({ error: `不支持的 key：${key}` }, { status: 400 });
    }
    const value = typeof item.value === 'string' ? item.value : JSON.stringify(item.value ?? '');
    if (value.length > 200000) {
      return NextResponse.json({ error: '单条数据过大' }, { status: 400 });
    }
    await run(
      `INSERT INTO user_data (user_id, key, value, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [user.id, key, value, now]
    );
  }
  return NextResponse.json({ ok: true });
}
