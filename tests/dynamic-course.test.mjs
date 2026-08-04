import { readdir, readFile } from 'node:fs/promises';
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
    assert.equal(body.levels.length, 9);
    assert.equal(body.levels[0].id, 0);
    assert.equal(body.levels[2].id, 2);
    assert.equal(body.levels[2].href, '/course/2');
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

test('all level data files expose the server-rendering contract', async () => {
  const files = await readdir(new URL('../data/levels', import.meta.url));
  const levelFiles = files.filter(file => /^level-\d+\.json$/.test(file)).sort();
  assert.equal(levelFiles.length, 9);

  for (const file of levelFiles) {
    const level = JSON.parse(await readFile(new URL(`../data/levels/${file}`, import.meta.url), 'utf8'));
    assert.equal(typeof level.id, 'number', file);
    assert.match(level.progressKey, /^gesp_lv\d+_prog$/, file);
    assert.ok(level.sourcePage, file);
    assert.ok(level.lessons.length > 0, file);
    assert.ok(level.lessons.every(lesson => lesson.id && lesson.anchor && lesson.title && lesson.practice), file);
  }
});

test('dynamic course shell loads the renderer script', async () => {
  const html = await readFile(new URL('../course.html', import.meta.url), 'utf8');
  assert.match(html, /id="courseRoot"/);
  assert.match(html, /src="course\.js"/);
});

test('server renders core pages through Express routes', async () => {
  await withServer(async baseUrl => {
    for (const route of ['/', '/courses', '/review', '/parent', '/syllabus', '/notes', '/papers']) {
      const response = await fetch(`${baseUrl}${route}`);
      const html = await response.text();
      assert.equal(response.status, 200, route);
      assert.match(html, /<header class="site-topbar">/, route);
      assert.doesNotMatch(html, /<div class="crumb">/, route);
    }
  });
});

test('server renders course pages from level data', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/course/2`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /Server Rendered Course/);
    assert.match(html, /data-progress-key="gesp_lv2_prog"/);
    assert.match(html, /href="\/courses" class="active" aria-current="page">课程/);
    assert.match(html, /id="pastPaperPractice"/);
    assert.match(html, /src="\/course-hydrate\.js"/);
  });
});

test('server renders a course map for all levels', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/courses`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /GESP C\+\+ 课程地图/);
    assert.match(html, /id="loginForm"/);
    assert.match(html, /src="\/site-auth\.js"/);
    assert.match(html, /href="\/course\/0"/);
    assert.match(html, /href="\/course\/8"/);
  });
});

test('home and course map share the same topbar controls', async () => {
  await withServer(async baseUrl => {
    const home = await (await fetch(`${baseUrl}/`)).text();
    const courses = await (await fetch(`${baseUrl}/courses`)).text();

    for (const marker of ['class="brand-mark"', 'href="/courses"', 'id="loginForm"', 'id="profileBar"', 'src="/site-auth.js"']) {
      assert.match(home, new RegExp(marker.replaceAll('/', '\\/')));
      assert.match(courses, new RegExp(marker.replaceAll('/', '\\/')));
    }
  });
});

test('legacy html entry points redirect to server-rendered routes', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/course.html?level=2`, { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), '/course/2');
  });
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
  assert.match(indexHtml, /\/course\/2/);
  assert.match(oldLevel2Html, /动态新版/);
  assert.match(oldLevel2Html, /\/course\/2/);
});
