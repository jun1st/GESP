import express from 'express';
import { listLevels, readLevel } from '../lib/courseData.js';

export function createApiRouter() {
  const router = express.Router();

  router.get('/api/levels', async (_req, res) => {
    try {
      res.json({ levels: await listLevels() });
    } catch (error) {
      res.status(500).json({ error: 'Unable to load course levels.' });
    }
  });

  router.get('/api/levels/:level', async (req, res) => {
    try {
      const level = Number(req.params.level);
      if (!Number.isInteger(level)) {
        res.status(404).json({ error: `Level ${req.params.level} not found.` });
        return;
      }

      res.json(await readLevel(level));
    } catch (error) {
      res.status(404).json({ error: `Level ${req.params.level} not found.` });
    }
  });

  return router;
}
