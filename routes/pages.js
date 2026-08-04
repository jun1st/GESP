import express from 'express';
import { pageRoutes, legacyRedirects, findLevelPage } from '../lib/siteConfig.js';
import { renderLegacyPage } from '../lib/legacyPage.js';

export function createPagesRouter() {
  const router = express.Router();

  for (const page of pageRoutes) {
    router.get(page.route, async (_req, res, next) => {
      try {
        res.type('html').send(await renderLegacyPage(page));
      } catch (error) {
        next(error);
      }
    });
  }

  router.get('/levels/:level', async (req, res, next) => {
    try {
      const levelPage = findLevelPage(req.params.level);
      if (!levelPage) {
        res.status(404).send('Level not found');
        return;
      }

      res.type('html').send(await renderLegacyPage({
        key: 'home',
        title: levelPage.title,
        description: `${levelPage.title} 互动课程页面。`,
        source: levelPage.source,
        shellClass: 'wrap'
      }));
    } catch (error) {
      next(error);
    }
  });

  router.get('/course.html', (req, res) => {
    const level = req.query.level || '2';
    res.redirect(301, `/course/${encodeURIComponent(level)}`);
  });

  for (const redirect of legacyRedirects) {
    router.get(redirect.from, (_req, res) => {
      res.redirect(301, redirect.to);
    });
  }

  return router;
}
