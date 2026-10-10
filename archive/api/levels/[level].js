import { readLevel } from '../../lib/courseData.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const level = Number(req.query.level);
  if (!Number.isInteger(level)) {
    res.status(404).json({ error: `Level ${req.query.level} not found.` });
    return;
  }

  try {
    res.status(200).json(await readLevel(level));
  } catch (error) {
    res.status(404).json({ error: `Level ${req.query.level} not found.` });
  }
}
