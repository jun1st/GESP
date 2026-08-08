'use client';

import { useState } from 'react';

export default function StarLoop() {
  const [n, setN] = useState(5);
  const [show, setShow] = useState(0);

  return (
    <div className="exp-card">
      <h3>⭐ 循环结构：数星星（for 循环）</h3>
      <div className="exp-row">
        <label className="exp-label">数几颗星：
          <input className="exp-range" type="range" min="1" max="10" value={n} onChange={(e) => { setN(Number(e.target.value)); setShow(0); }} />
          <b>{n}</b>
        </label>
        <button className="exp-btn go" onClick={() => setShow((s) => (s < n ? s + 1 : s))}>⭐ 数一颗</button>
        <button className="exp-btn" onClick={() => setShow(0)}>🔄 重置</button>
      </div>
      <div className="stars">{Array.from({ length: show }).map((_, i) => <span key={i} className="star-anim">⭐</span>)}</div>
      <pre className="exp-out" style={{ fontFamily: 'monospace' }}>
{`for (int i = 1; i <= ${n}; i++) {
    cout << "⭐";   // 已输出 ${show} 颗
}`}
      </pre>
    </div>
  );
}
