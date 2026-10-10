import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const levelsDir = path.join(rootDir, 'data', 'levels');

export async function readLevel(level) {
  const filePath = path.join(levelsDir, `level-${level}.json`);
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function listLevels() {
  const files = await readdir(levelsDir);
  const levels = await Promise.all(
    files
      .filter(file => /^level-\d+\.json$/.test(file))
      .map(async file => {
        const level = JSON.parse(await readFile(path.join(levelsDir, file), 'utf8'));
        return {
          id: level.id,
          title: level.title,
          description: level.description,
          lessonCount: level.lessons.length,
          href: `/course/${level.id}`
        };
      })
  );

  return levels.sort((a, b) => a.id - b.id);
}
