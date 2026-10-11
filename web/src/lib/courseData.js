import fs from 'node:fs/promises';
import path from 'node:path';

const levelsDir = path.join(process.cwd(), 'data', 'levels');

export async function readLevel(id) {
  const raw = await fs.readFile(path.join(levelsDir, `level-${id}.json`), 'utf8');
  return JSON.parse(raw);
}

export async function readFundamentals() {
  const raw = await fs.readFile(path.join(levelsDir, 'fundamentals.json'), 'utf8');
  return JSON.parse(raw);
}

export async function listLevels() {
  const files = await fs.readdir(levelsDir);
  const levels = await Promise.all(
    files
      .filter((file) => /^level-\d+\.json$/.test(file))
      .map(async (file) => {
        const level = JSON.parse(await fs.readFile(path.join(levelsDir, file), 'utf8'));
        return {
          id: level.id,
          title: level.title,
          description: level.description,
          emoji: level.emoji,
          lessonCount: level.lessons.length
        };
      })
  );
  return levels.sort((a, b) => a.id - b.id);
}

// slug: 'level-3' 或 'fundamentals'
export async function readRelated(slug) {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'papers', 'related', `${slug}.json`), 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { level: slug, lessons: [] };
  }
}

export const LEVEL_CN = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
  6: '六级',
  7: '七级',
  8: '八级'
};

// 只含进度统计所需字段（进度 key、课数）。客户端组件只能拿这份，
// 不能直接 import 课程 JSON，否则整套课程内容会被打进公开的 JS 包。
// 顺序：基础常识，然后 1~8 级。
export async function getLevelMeta() {
  const list = [await readFundamentals()];
  for (let i = 1; i <= 8; i += 1) list.push(await readLevel(i));
  return list.map((l) => ({ progressKey: l.progressKey, total: l.lessons.length }));
}
