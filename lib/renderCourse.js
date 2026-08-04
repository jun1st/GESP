import { renderDocument, escapeHtml } from './renderHtml.js';

function renderTags(tags = []) {
  return tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
}

function renderLesson(lesson, index, level) {
  const blocks = (lesson.blocks || []).map(block => `<li>${escapeHtml(block)}</li>`).join('');
  const practiceHref = lesson.practice?.href
    ? `<a href="${escapeHtml(lesson.practice.href)}">打开练习</a>`
    : '';

  return `
    <article class="lesson-card" id="${escapeHtml(lesson.anchor)}">
      <h2>${escapeHtml(lesson.title)}</h2>
      <p>${escapeHtml(lesson.summary)}</p>
      <div class="lesson-tags">${renderTags(lesson.tags)}</div>
      <p><b>目标：</b>${escapeHtml(lesson.goal)}</p>
      <ul class="lesson-blocks">${blocks}</ul>
      <div class="lesson-practice">
        <b>${escapeHtml(lesson.practice?.title || '练习')}</b>
        <p>${escapeHtml(lesson.practice?.prompt || '完成本课配套练习。')}</p>
        ${practiceHref}
      </div>
      <div class="lesson-actions">
        <button data-lesson-index="${index}">学完了，打卡</button>
        <a href="/levels/${escapeHtml(level.id)}#${escapeHtml(lesson.anchor)}">打开互动版</a>
      </div>
    </article>`;
}

function renderPracticeLinks(links = []) {
  return links.map(link => `
    <div class="practice-card">
      <b>${escapeHtml(link.title)}</b>
      <p>${escapeHtml(link.description)}</p>
      <a href="${escapeHtml(link.href)}">打开</a>
    </div>`).join('');
}

export function renderCoursePage(level) {
  const mapItems = level.lessons.map((lesson, index) => `
    <a href="#${escapeHtml(lesson.anchor)}">
      <b>${index + 1}. ${escapeHtml(lesson.title.replace(/^第 \d+ 课：/, ''))}</b>
      <span>未完成</span>
    </a>`).join('');

  const body = `
    <main id="courseRoot" data-progress-key="${escapeHtml(level.progressKey)}">
      <section class="course-hero">
        <p class="eyebrow">Server Rendered Course</p>
        <h1>${escapeHtml(level.emoji)} ${escapeHtml(level.title)}</h1>
        <p>${escapeHtml(level.description)}</p>
        <div class="progress-track"><i style="width:0%"></i></div>
        <p>已完成 0 / ${level.lessons.length} 课（0%）</p>
        <div class="course-map">${mapItems}</div>
      </section>

      <section class="course-panel">
        <h2>服务端渲染课程内容</h2>
        <div class="lesson-list">
          ${level.lessons.map((lesson, index) => renderLesson(lesson, index, level)).join('')}
        </div>
      </section>

      <section class="course-panel">
        <h2>练习入口</h2>
        <div class="practice-grid">${renderPracticeLinks(level.practiceLinks)}</div>
      </section>
    </main>`;

  return renderDocument({
    title: level.title,
    description: level.description,
    activeKey: 'courses',
    shellClass: 'course-shell',
    headExtra: `<link rel="stylesheet" href="/course.css">`,
    body,
    bodyEnd: `<script src="/course-hydrate.js"></script>`
  });
}

export function renderCoursesIndex(levels) {
  const cards = levels.map(level => `
    <a class="practice-card" href="${escapeHtml(level.href)}">
      <b>${escapeHtml(level.title)}</b>
      <p>${escapeHtml(level.description)}</p>
      <span>${escapeHtml(level.lessonCount)} 课</span>
    </a>`).join('');

  return renderDocument({
    title: 'GESP C++ 课程地图',
    description: 'GESP C++ 0-8 级动态课程地图。',
    activeKey: 'courses',
    shellClass: 'course-shell',
    headExtra: `<link rel="stylesheet" href="/course.css">`,
    body: `
      <main>
        <section class="course-hero">
          <p class="eyebrow">Course Map</p>
          <h1>GESP C++ 课程地图</h1>
          <p>从基础常识到八级综合训练，所有课程都从服务端动态渲染。</p>
        </section>
        <section class="course-panel">
          <h2>选择级别</h2>
          <div class="practice-grid">${cards}</div>
        </section>
      </main>`
  });
}
