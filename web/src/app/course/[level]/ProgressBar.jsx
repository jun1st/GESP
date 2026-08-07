'use client';

import { useEffect, useState } from 'react';

export default function ProgressBar({ progressKey, total }) {
  const [done, setDone] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey));
      const arr = Array.isArray(saved) ? saved : [];
      setDone(arr.filter(Boolean).length);
    } catch (e) {}
  }, [progressKey, total, tick]);

  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div className="progress-track"><i style={{ width: pct + '%' }} /></div>
      <p>已完成 {done} / {total} 课（{pct}%）</p>
    </div>
  );
}
