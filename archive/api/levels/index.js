import { listLevels } from '../../lib/courseData.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    res.status(200).json({ levels: await listLevels() });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load course levels.' });
  }
}
