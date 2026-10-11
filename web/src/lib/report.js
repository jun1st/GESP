import fs from 'node:fs/promises';
import path from 'node:path';
import { query } from './db';
import { loadPaper, singleKey, judgeKey } from './papers';
import { readLevel } from './courseData';

export const ATTEMPTS_KEY = 'gesp_mock_attempts';

// 薄弱项判定：该课至少做过 MIN_TOTAL 道题、至少错 MIN_WRONG 道，且正确率低于 WEAK_ACCURACY
const MIN_TOTAL = 3;
const MIN_WRONG = 2;
const WEAK_ACCURACY = 0.6;

let mapCache = null;
export async function loadLessonMap() {
  if (mapCache) return mapCache;
  try {
    mapCache = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'papers', 'lesson-map.json'), 'utf8'));
  } catch {
    mapCache = {};
  }
  return mapCache;
}

export async function readAttempts(userId) {
  const rows = await query('SELECT value FROM user_data WHERE user_id = $1 AND key = $2', [userId, ATTEMPTS_KEY]);
  try {
    const list = JSON.parse(rows[0]?.value || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function lessonTitles(level, cache) {
  if (!cache[level]) {
    const data = await readLevel(level);
    cache[level] = Object.fromEntries(data.lessons.map((l) => [l.anchor, l.title]));
  }
  return cache[level];
}

// 只统计有标准答案且孩子作答过的题；未作答视为答错
export async function buildReport(userId) {
  const attempts = await readAttempts(userId);
  const map = await loadLessonMap();
  const stat = new Map(); // `${level}/${anchor}` -> { level, anchor, total, wrong }
  const titleCache = {};

  for (const a of attempts) {
    if (!a.answers) continue; // 旧版记录没有逐题作答
    const paper = await loadPaper(a.session, a.level);
    const lessonOf = map[`${a.session}/${a.level}`];
    if (!paper || !lessonOf) continue;
    for (const type of ['single', 'judge']) {
      const keyOf = type === 'single' ? singleKey : judgeKey;
      for (const q of paper[type]) {
        const key = keyOf(q);
        if (!key) continue;
        const anchor = lessonOf[`${type}:${q.no}`];
        if (!anchor) continue; // 未覆盖题不计入薄弱项
        const id = `${a.level}/${anchor}`;
        const s = stat.get(id) || { level: a.level, anchor, total: 0, wrong: 0 };
        s.total += 1;
        if (a.answers[type]?.[q.no] !== key) s.wrong += 1;
        stat.set(id, s);
      }
    }
  }

  const weakSpots = [];
  for (const s of stat.values()) {
    const accuracy = (s.total - s.wrong) / s.total;
    if (s.total >= MIN_TOTAL && s.wrong >= MIN_WRONG && accuracy < WEAK_ACCURACY) {
      const titles = await lessonTitles(s.level, titleCache);
      weakSpots.push({ ...s, accuracy: Math.round(accuracy * 100), title: titles[s.anchor] || s.anchor });
    }
  }
  weakSpots.sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong);

  // 趋势图用：按时间从旧到新，只保留有总分的记录
  const trend = attempts
    .filter((a) => typeof a.total === 'number')
    .map((a) => ({ id: a.id, session: a.session, level: a.level, total: a.total, at: a.at }))
    .reverse();

  const list = attempts.map((a) => ({
    id: a.id,
    session: a.session,
    level: a.level,
    objective: a.objective ?? a.score,
    total: typeof a.total === 'number' ? a.total : null,
    durationSec: a.durationSec,
    at: a.at
  }));

  return { attempts: list, trend, weakSpots };
}

// 管理员：各 Level 的未覆盖题统计
export async function uncoveredStats() {
  const map = await loadLessonMap();
  const byLevel = {};
  for (const [key, entry] of Object.entries(map)) {
    const level = Number(key.split('/')[1]);
    const row = (byLevel[level] ||= { level, total: 0, uncovered: 0, perLesson: {} });
    for (const anchor of Object.values(entry)) {
      row.total += 1;
      if (anchor === null) row.uncovered += 1;
      else row.perLesson[anchor] = (row.perLesson[anchor] || 0) + 1;
    }
  }
  return Object.values(byLevel).sort((a, b) => a.level - b.level);
}
