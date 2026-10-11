'use client';

import { useEffect, useState } from 'react';
import { LEVEL_NAMES } from '@/lib/levelNames';

// 取模拟考报告（会员专享）。parent / review 两个页面共用。
export function useReport() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    fetch('/api/account/report', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '加载失败');
        if (alive) setReport(data);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);
  return { report, error };
}

export default function WeakSpots({ report, error }) {
  if (error) return <p className="pb-note">{error}</p>;
  if (!report) return <p className="pb-note">加载中…</p>;
  if (report.weakSpots.length === 0) {
    return (
      <p className="pb-note">
        {report.attempts.length === 0
          ? '还没有模拟考记录。去「真题库」做一套模拟考，这里就会显示薄弱的课。'
          : '暂时没有发现薄弱的课（同一课至少做过 3 道题、错 2 道以上、正确率低于 60% 才会出现在这里）。'}
      </p>
    );
  }
  return (
    <ul className="ws-list">
      {report.weakSpots.map((w) => (
        <li key={`${w.level}/${w.anchor}`}>
          <span className="ws-lv">{LEVEL_NAMES[w.level]}</span>
          <b>{w.title}</b>
          <span className="ws-acc">做过 {w.total} 题，错 {w.wrong} 题，正确率 {w.accuracy}%</span>
          <a className="mx-btn" href={`/course/${w.level}/#${w.anchor}`}>去补这课 →</a>
        </li>
      ))}
    </ul>
  );
}
