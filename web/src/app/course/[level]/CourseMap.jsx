'use client';

import { useEffect, useState } from 'react';

export default function CourseMap({ lessons, progressKey }) {
  const [prog, setProg] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(progressKey) || '[]');
        setProg(Array.isArray(saved) ? saved.map(Boolean) : []);
      } catch (e) {}
    };
    load();
    window.addEventListener('gesp-progress', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('gesp-progress', load);
      window.removeEventListener('storage', load);
    };
  }, [progressKey]);

  const firstUndone = prog.indexOf(false);

  return (
    <div className="course-map">
      {lessons.map((lesson, index) => {
        const done = Boolean(prog[index]);
        const cur = !done && firstUndone === index;
        const cls = done ? 'is-done' : cur ? 'cur' : '';
        return (
          <a key={lesson.anchor} href={`#${lesson.anchor}`} className={cls}>
            <b>{index + 1}. {lesson.title.replace(/^第 \d+ 课：/, '')}</b>
            <span>{done ? '✅ 已完成' : cur ? '▶️ 继续学习' : '🔒 未完成'}</span>
          </a>
        );
      })}
    </div>
  );
}
