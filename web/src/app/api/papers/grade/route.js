import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getMemberContext } from '@/lib/member';
import { query, run } from '@/lib/db';
import { loadPaper, gradePaper } from '@/lib/papers';
import { computeTotal, SELF_VALUE } from '@/lib/score';

const ATTEMPTS_KEY = 'gesp_mock_attempts';
const MAX_ATTEMPTS = 50;

async function readAttempts(userId) {
  const rows = await query('SELECT value FROM user_data WHERE user_id = $1 AND key = $2', [userId, ATTEMPTS_KEY]);
  try {
    const list = JSON.parse(rows[0]?.value || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeAttempts(userId, list, at) {
  await run(
    `INSERT INTO user_data (user_id, key, value, updated_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [userId, ATTEMPTS_KEY, JSON.stringify(list), at]
  );
}

function cleanAnswers(raw) {
  const out = { single: {}, judge: {} };
  for (const [no, v] of Object.entries(raw?.single || {})) if (/^[A-D]$/.test(v)) out.single[no] = v;
  for (const [no, v] of Object.entries(raw?.judge || {})) if (v === 'T' || v === 'F') out.judge[no] = v;
  return out;
}

async function guard() {
  const { user, isMember, hasLevel } = await getMemberContext();
  if (!user) return { error: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  if (!isMember) return { error: NextResponse.json({ error: '会员专享' }, { status: 403 }) };
  return { user, hasLevel };
}

// 交卷：自动判分并保存完整 Attempt（含每题作答）
export async function POST(request) {
  const g = await guard();
  if (g.error) return g.error;
  const { user, hasLevel } = g;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  if (!hasLevel(body.level)) return NextResponse.json({ error: '该级别未开通会员' }, { status: 403 });
  const paper = await loadPaper(body.session, body.level);
  if (!paper) return NextResponse.json({ error: '试卷不存在' }, { status: 404 });

  const answers = cleanAnswers(body.answers);
  const result = gradePaper(paper, answers);
  const t = computeTotal(result.sections, null);
  const attempt = {
    id: randomUUID(),
    session: body.session,
    level: Number(body.level),
    score: result.score,
    full: result.full,
    sections: result.sections,
    answers,
    self: {},
    objective: t.objective,
    total: t.total,
    durationSec: Math.max(0, Math.min(Number(body.durationSec) || 0, 86400)),
    at: new Date().toISOString()
  };

  const list = [attempt, ...(await readAttempts(user.id))].slice(0, MAX_ATTEMPTS);
  await writeAttempts(user.id, list, attempt.at);

  return NextResponse.json({ result, attempt });
}

// 编程题自评：{ id, self: { [no]: 'full'|'part'|'none' } }
export async function PUT(request) {
  const g = await guard();
  if (g.error) return g.error;
  const { user } = g;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  const list = await readAttempts(user.id);
  const attempt = list.find((a) => a.id === body.id);
  if (!attempt) return NextResponse.json({ error: '作答记录不存在' }, { status: 404 });

  const self = {};
  for (const [no, v] of Object.entries(body.self || {})) {
    if (SELF_VALUE[v] !== undefined) self[no] = v;
  }
  attempt.self = self;
  const t = computeTotal(attempt.sections, self);
  attempt.total = t.total;
  attempt.objective = t.objective;

  await writeAttempts(user.id, list, new Date().toISOString());
  return NextResponse.json({ attempt });
}
