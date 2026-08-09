'use client';

import { useEffect, useState } from 'react';

export default function ProgressBar({ progressKey, total }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const load = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(progressKey));
        const arr = Array.isArray(saved) ? saved : [];
        setDone(arr.filter(Boolean).length);
      } catch (e) {}
    };
    load();
    // 打卡后（gesp-progress）或其它标签页改动（storage）时自动刷新
    window.addEventListener('gesp-progress', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('gesp-progress', load);
      window.removeEventListener('storage', load);
    };
  }, [progressKey, total]);

  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div className="progress-track"><i style={{ width: pct + '%' }} /></div>
      <p>已完成 {done} / {total} 课（{pct}%）</p>
    </div>
  );
}
