const root = document.getElementById('courseRoot');

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

function refresh(progress) {
  const done = progress.filter(Boolean).length;
  const percent = Math.round(done / progress.length * 100);
  const bar = root.querySelector('.progress-track i');
  const summary = root.querySelector('.progress-track + p');
  if (bar) bar.style.width = `${percent}%`;
  if (summary) summary.textContent = `已完成 ${done} / ${progress.length} 课（${percent}%）`;

  root.querySelectorAll('[data-lesson-index]').forEach(button => {
    const index = Number(button.dataset.lessonIndex);
    button.textContent = progress[index] ? '已打卡，点击取消' : '学完了，打卡';
  });

  root.querySelectorAll('.course-map a').forEach((link, index) => {
    link.classList.toggle('is-done', Boolean(progress[index]));
    const status = link.querySelector('span');
    if (status) status.textContent = progress[index] ? '已完成' : '未完成';
  });
}

if (root) {
  const buttons = [...root.querySelectorAll('[data-lesson-index]')];
  const key = root.dataset.progressKey;
  const progress = getProgress(key, buttons.length);

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.lessonIndex);
      progress[index] = !progress[index];
      saveProgress(key, progress);
      refresh(progress);
    });
  });

  refresh(progress);
}
