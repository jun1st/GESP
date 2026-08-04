import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './routes/api.js';
import { createCoursesRouter } from './routes/courses.js';
import { createPagesRouter } from './routes/pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(createApiRouter());
  app.use(createCoursesRouter());
  app.use(createPagesRouter());

  app.use(express.static(__dirname, { extensions: ['html'] }));

  return app;
}

const app = createApp();

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`GESP learning center listening on http://localhost:${port}`);
  });
}
