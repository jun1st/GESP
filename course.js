const root = document.getElementById('courseRoot');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getLevelId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('level') || '2';
}

function getProgress(key, total) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved) && saved.length === total) return saved.map(Boolean);
  } catch (error) {}
  return new Array(total).fill(false);
}

function saveProgress(key, progress) {
  localStorage.setItem(key, JSON.stringify(progress));
}

function renderTags(tags) {
  return tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
}

function renderLesson(lesson, index, progress, level) {
  const blocks = lesson.blocks.map(block => `<li>${escapeHtml(block)}</li>`).join('');
  const practiceHref = lesson.practice.href
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
        <b>${escapeHtml(lesson.practice.title)}</b>
        <p>${escapeHtml(lesson.practice.prompt)}</p>
        ${practiceHref}
      </div>
      <div class="lesson-actions">
        <button data-lesson-index="${index}">${progress[index] ? '已打卡，点击取消' : '学完了，打卡'}</button>
        <a href="${escapeHtml(level.sourcePage)}#${escapeHtml(lesson.anchor)}">查看旧版互动内容</a>
      </div>
    </article>
  `;
}

function renderPracticeLinks(links) {
  return links.map(link => `
    <div class="practice-card">
      <b>${escapeHtml(link.title)}</b>
      <p>${escapeHtml(link.description)}</p>
      <a href="${escapeHtml(link.href)}">打开</a>
    </div>
  `).join('');
}

function renderLevel(level) {
  const progress = getProgress(level.progressKey, level.lessons.length);
  const done = progress.filter(Boolean).length;
  const percent = Math.round(done / level.lessons.length * 100);
  const mapItems = level.lessons.map((lesson, index) => `
    <a class="${progress[index] ? 'is-done' : ''}" href="#${escapeHtml(lesson.anchor)}">
      <b>${index + 1}. ${escapeHtml(lesson.title.replace(/^第 \\d+ 课：/, ''))}</b>
      <span>${progress[index] ? '已完成' : '未完成'}</span>
    </a>
  `).join('');

  root.innerHTML = `
    <section class="course-hero">
      <p class="eyebrow">Dynamic Course</p>
      <h1>${escapeHtml(level.emoji)} ${escapeHtml(level.title)}</h1>
      <p>${escapeHtml(level.description)}</p>
      <div class="progress-track"><i style="width:${percent}%"></i></div>
      <p>已完成 ${done} / ${level.lessons.length} 课（${percent}%）</p>
      <div class="course-map">${mapItems}</div>
    </section>

    <section class="course-panel">
      <h2>动态加载课程内容</h2>
      <div class="lesson-list">
        ${level.lessons.map((lesson, index) => renderLesson(lesson, index, progress, level)).join('')}
      </div>
    </section>

    <section class="course-panel">
      <h2>练习入口</h2>
      <div class="practice-grid">${renderPracticeLinks(level.practiceLinks)}</div>
    </section>
  `;

  root.querySelectorAll('[data-lesson-index]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.lessonIndex);
      progress[index] = !progress[index];
      saveProgress(level.progressKey, progress);
      renderLevel(level);
    });
  });
}

async function init() {
  try {
    const response = await fetch(`/api/levels/${encodeURIComponent(getLevelId())}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const level = await response.json();
    document.title = level.title;
    renderLevel(level);
  } catch (error) {
    root.innerHTML = '<div class="course-panel course-empty">课程加载失败，请确认服务端已启动，并且该级别已经迁移。</div>';
  }
}

init();
