import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../server.js';

async function withServer(run) {
  const app = createApp();
  const server = createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('course API lists migrated levels', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/levels`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.levels.length, 1);
    assert.equal(body.levels[0].id, 2);
    assert.equal(body.levels[0].href, '/course.html?level=2');
  });
});

test('course API serves structured level 2 content', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/levels/2`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.id, 2);
    assert.equal(body.progressKey, 'gesp_lv2_prog');
    assert.equal(body.lessons.length, 10);
    assert.equal(body.lessons[0].anchor, 's1');
    assert.equal(body.lessons.at(-1).anchor, 'pastPaperPractice');
  });
});

test('course API returns 404 for unmigrated levels', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/levels/9`);
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.match(body.error, /not found/i);
  });
});

test('dynamic course shell loads the renderer script', async () => {
  const html = await readFile(new URL('../course.html', import.meta.url), 'utf8');
  assert.match(html, /id="courseRoot"/);
  assert.match(html, /src="course\.js"/);
});

test('package scripts support starting and testing the Express app', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.start, 'node server.js');
  assert.match(pkg.scripts.test, /node --test/);
  assert.ok(pkg.dependencies.express);
});

test('level 2 entry points are wired to the dynamic course route', async () => {
  const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const oldLevel2Html = await readFile(new URL('../GESP2学习乐园.html', import.meta.url), 'utf8');
  assert.match(indexHtml, /course\.html\?level=2/);
  assert.match(oldLevel2Html, /动态新版/);
  assert.match(oldLevel2Html, /course\.html\?level=2/);
});
