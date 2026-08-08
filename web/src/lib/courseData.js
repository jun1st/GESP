import fs from 'node:fs/promises';
import path from 'node:path';

const levelsDir = path.join(process.cwd(), 'data', 'levels');

export async function readLevel(id) {
  const raw = await fs.readFile(path.join(levelsDir, `level-${id}.json`), 'utf8');
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

export const LEVEL_CN = {
  0: '零级入门',
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
  6: '六级',
  7: '七级',
  8: '八级'
};
