'use client';

import { useEffect, useState } from 'react';

function daysAgo(t) {
  const d = Math.floor((Date.now() - t) / 86400000);
  return d <= 0 ? '今天' : d + ' 天前';
}

export default function ReviewApp() {
  const [wrong, setWrong] = useState([]);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('gesp_wrong') || '[]');
      setWrong(Array.isArray(list) ? list : []);
    } catch (e) {}
  }, []);

  const save = (list) => {
    localStorage.setItem('gesp_wrong', JSON.stringify(list));
    setWrong([...list]);
  };

  const answer = (idx, chosen) => {
    const item = wrong[idx];
    if (!item) return;
    if (chosen === item.a) {
      save(wrong.filter((_, i) => i !== idx));
    }
  };

  const clearAll = () => save([]);

  const groups = {};
  wrong.forEach((w, i) => {
    (groups[w.lv] = groups[w.lv] || []).push(i);
  });

  return (
    <div className="panel">
      <h2>📊 错题总览</h2>
      <div className="callout info">
        {wrong.length === 0
          ? '🎉 错题本是空的！去课程做"考一考"，答错的题会自动收集到这里。'
          : `📚 共 ${wrong.length} 道错题，建议每周重做一遍。`}
      </div>
      <button className="btn" onClick={clearAll} disabled={wrong.length === 0}>🗑️ 清空错题本</button>

      <h2>✏️ 错题练习</h2>
      {Object.keys(groups).map((lv) => (
        <div key={lv}>
          <div className="lvgroup">{lv}（{groups[lv].length} 题）</div>
          {groups[lv].map((idx) => {
            const w = wrong[idx];
            return (
              <div className="qi" key={idx}>
                <div className="qhead">{w.lesson} ｜ 记于 {daysAgo(w.time)}</div>
                <div className="qq">{w.q}</div>
                {w.o.map((opt, j) => (
                  <button key={j} className="qo" onClick={() => answer(idx, j)}>
                    {'ABCD'[j]}. {opt}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
