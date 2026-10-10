import express from 'express';
import { listLevels, readLevel } from '../lib/courseData.js';
import { renderCoursePage, renderCoursesIndex } from '../lib/renderCourse.js';

export function createCoursesRouter() {
  const router = express.Router();

  router.get('/courses', async (_req, res, next) => {
    try {
      res.type('html').send(renderCoursesIndex(await listLevels()));
    } catch (error) {
      next(error);
    }
  });

  router.get('/course/:level', async (req, res, next) => {
    try {
      const level = Number(req.params.level);
      if (!Number.isInteger(level)) {
        res.status(404).send('Course not found');
        return;
      }

      res.type('html').send(renderCoursePage(await readLevel(level)));
    } catch (error) {
      res.status(404).send('Course not found');
    }
  });

  return router;
}
