import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function readLevel(level) {
  const filePath = path.join(__dirname, 'data', 'levels', `level-${level}.json`);
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export function createApp() {
  const app = express();

  app.get('/api/levels', async (_req, res) => {
    try {
      const level2 = await readLevel(2);
      res.json({
        levels: [
          {
            id: level2.id,
            title: level2.title,
            description: level2.description,
            lessonCount: level2.lessons.length,
            href: '/course.html?level=2'
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Unable to load course levels.' });
    }
  });

  app.get('/api/levels/:level', async (req, res) => {
    try {
      const level = Number(req.params.level);
      if (!Number.isInteger(level) || level !== 2) {
        res.status(404).json({ error: `Level ${req.params.level} not found.` });
        return;
      }
      res.json(await readLevel(level));
    } catch (error) {
      res.status(404).json({ error: `Level ${req.params.level} not found.` });
    }
  });

  app.use(express.static(__dirname, { extensions: ['html'] }));

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, () => {
    console.log(`GESP learning center listening on http://localhost:${port}`);
  });
}
