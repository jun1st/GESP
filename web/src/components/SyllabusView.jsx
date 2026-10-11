'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 考纲：考点 → 对应课（带进度）→ 本课相关真题数。进度存在浏览器本地。
export default function SyllabusView({ levels }) {
  const [active, setActive] = useState(levels[0].level);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const load = () => {
      const next = {};
      for (const lv of levels) {
        try {
          const saved = JSON.parse(localStorage.getItem(lv.progressKey) || '[]');
          next[lv.level] = Array.isArray(saved) ? saved.map(Boolean) : [];
        } catch (e) {
          next[lv.level] = [];
        }
      }
      setProgress(next);
    };
    load();
    window.addEventListener('gesp-progress', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('gesp-progress', load);
      window.removeEventListener('storage', load);
    };
  }, [levels]);

  const lv = levels.find((x) => x.level === active);
  const prog = progress[lv.level] || [];
  const mastered = (item) => item.lessons.length > 0 && item.lessons.every((l) => prog[l.index]);
  const covered = lv.items.filter((i) => i.lessons.length > 0).length;
  const masteredCount = lv.items.filter(mastered).length;

  return (
    <div className="syl">
      <div className="papers-levels" role="tablist">
        {levels.map((x) => (
          <button
            key={x.level}
            type="button"
            className={'papers-level-chip' + (x.level === active ? ' on' : '')}
            onClick={() => setActive(x.level)}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div className="syl-head">
        <h2>{lv.name} · 知识目标</h2>
        <p>{lv.goal}</p>
        <p className="syl-sum">
          共 {lv.items.length} 个考点 · 课程已覆盖 {covered} 个 · 已掌握 {masteredCount} 个
        </p>
      </div>

      <div className="syl-list">
        {lv.items.map((item) => {
          const done = item.lessons.filter((l) => prog[l.index]).length;
          const total = item.lessons.reduce((s, l) => s + l.count, 0);
          const ok = mastered(item);
          return (
            <div key={item.name} className={'syl-item' + (ok ? ' is-done' : '')}>
              <div className="syl-item-head">
                <b>{item.name}</b>
                {item.lessons.length === 0 ? (
                  <span className="syl-gap">暂无对应课程</span>
                ) : (
                  <span className="syl-meta">
                    已学 {done} / {item.lessons.length} 课{total > 0 ? ` · 涉及 ${total} 题` : ''}
                  </span>
                )}
              </div>
              {item.lessons.length > 0 && (
                <ul className="syl-lessons">
                  {item.lessons.map((l) => (
                    <li key={l.anchor}>
                      <Link href={`/course/${lv.level}#${l.anchor}`}>{l.title}</Link>
                      <span className={prog[l.index] ? 'syl-ok' : ''}>{prog[l.index] ? '已完成' : '未学'}</span>
                      <Link className="syl-q" href={`/course/${lv.level}#${l.anchor}`}>
                        {l.count > 0 ? `${l.count} 题` : '暂无真题'}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
