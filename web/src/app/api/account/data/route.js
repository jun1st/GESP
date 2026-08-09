import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, run } from '@/lib/db';
import { isCloudKey } from '@/lib/syncKeys';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  const rows = await query('SELECT key, value FROM user_data WHERE user_id = $1', [session.id]);
  const data = {};
  for (const row of rows) {
    data[row.key] = row.value;
  }
  return NextResponse.json({ data });
}

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
      [session.id, key, value, now]
    );
  }
  return NextResponse.json({ ok: true });
}
