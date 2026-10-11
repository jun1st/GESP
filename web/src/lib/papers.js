import fs from 'node:fs/promises';
import path from 'node:path';

// 题目（含答案）放在服务端目录，不放 public，避免被直接下载
const ROOT = path.join(process.cwd(), 'data', 'papers', 'sessions');
const INDEX = path.join(process.cwd(), 'public', 'data', 'papers', 'index.json');

// 非会员每个 Level 可查看的样例题数量
export const SAMPLE_COUNT = 5;

export function isValidSession(s) {
  return /^\d{4}-\d{2}$/.test(String(s));
}

export function isValidLevel(l) {
  return /^[1-8]$/.test(String(l));
}

export async function loadSessions() {
  try {
    return JSON.parse(await fs.readFile(INDEX, 'utf8'));
  } catch {
    return [];
  }
}

export async function loadPaper(session, level) {
  if (!isValidSession(session) || !isValidLevel(level)) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, session, `level-${level}.json`), 'utf8'));
  } catch {
    return null;
  }
}

const JUDGE_MAP = { 对: 'T', 错: 'F' };

// 题目是否可评分：单选需要 A-D 答案；判断需要“对/错”
export function singleKey(q) {
  return /^[A-D]$/.test(q.answer || '') ? q.answer : null;
}

export function judgeKey(q) {
  return JUDGE_MAP[q.answer] || null;
}

// 样例：该 Level 最近一个考季的前 SAMPLE_COUNT 道单选题（含答案与解析）
export async function loadSample(level) {
  if (!isValidLevel(level)) return null;
  const sessions = await loadSessions();
  const latest = [...sessions].reverse().find((s) => s.levels?.includes(Number(level)));
  if (!latest) return null;
  const paper = await loadPaper(latest.batch, level);
  if (!paper) return null;
  return {
    batch: paper.batch,
    level: Number(level),
    single: paper.single.slice(0, SAMPLE_COUNT),
    judge: [],
    program: [],
    sample: true
  };
}

// 发给浏览器的试卷：去掉答案和解析
export function toExamView(paper) {
  return {
    single: paper.single.map((q) => ({ no: q.no, text: q.text, options: q.options })),
    judge: paper.judge.map((q) => ({ no: q.no, text: q.text })),
    program: paper.program.map((q) => ({ no: q.no, title: q.title, text: q.text })),
    scorable: {
      single: paper.single.filter((q) => singleKey(q)).length,
      judge: paper.judge.filter((q) => judgeKey(q)).length
    },
    total: {
      single: paper.single.length,
      judge: paper.judge.length,
      program: paper.program.length
    }
  };
}

// 评分：单选、判断各题 1 分，仅统计有标准答案的题；编程题不计分。
export function gradePaper(paper, answers) {
  const result = {
    single: [], judge: [], score: 0, full: 0,
    sections: { single: { score: 0, full: 0 }, judge: { score: 0, full: 0 }, programCount: paper.program.length }
  };
  for (const q of paper.single) {
    const key = singleKey(q);
    const mine = answers?.single?.[q.no] || null;
    const scored = Boolean(key);
    const correct = scored && mine === key;
    if (scored) { result.full += 1; result.sections.single.full += 1; }
    if (correct) { result.score += 1; result.sections.single.score += 1; }
    result.single.push({ no: q.no, scored, correct, mine, answer: q.answer || '', analysis: q.analysis || '' });
  }
  for (const q of paper.judge) {
    const key = judgeKey(q);
    const mine = answers?.judge?.[q.no] || null;
    const scored = Boolean(key);
    const correct = scored && mine === key;
    if (scored) { result.full += 1; result.sections.judge.full += 1; }
    if (correct) { result.score += 1; result.sections.judge.score += 1; }
    result.judge.push({
      no: q.no, scored, correct, mine,
      answer: key === 'T' ? '对' : key === 'F' ? '错' : '',
      analysis: q.analysis || ''
    });
  }
  result.program = paper.program.map((q) => ({
    no: q.no, title: q.title || '', outline: q.outline || '', thinking: q.thinking || '', program: q.program || ''
  }));
  return result;
}
