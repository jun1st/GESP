'use client';

import { useState } from 'react';

export default function MathButtons() {
  const [a, setA] = useState(-9);
  const [b, setB] = useState(3);
  const [out, setOut] = useState('点一个按钮试试～');

  const run = (fn) => {
    if (fn === 'abs') setOut('abs(-' + Math.abs(a) + ') = ' + Math.abs(a));
    if (fn === 'sqrt') setOut(a < 0 ? '😅 负数没有平方根！试试 a = 9 吧。' : 'sqrt(' + a + ') ≈ ' + Math.sqrt(a).toFixed(4));
    if (fn === 'max') setOut('max(' + a + ', ' + b + ') = ' + Math.max(a, b));
    if (fn === 'min') setOut('min(' + a + ', ' + b + ') = ' + Math.min(a, b));
    if (fn === 'pow') setOut('pow(' + a + ', ' + b + ') = ' + Math.pow(a, b));
    if (fn === 'round') setOut('round(' + a + ') = ' + Math.round(a));
  };

  return (
    <div className="exp-card">
      <h3>🎲 数学函数小工具（&lt;cmath&gt;）</h3>
      <div className="exp-row">
        <label className="exp-label">a：<input className="exp-input" type="number" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
        <label className="exp-label">b：<input className="exp-input" type="number" value={b} onChange={(e) => setB(Number(e.target.value))} /></label>
      </div>
      <div className="exp-row">
        {[['abs', '|a| 绝对值'], ['sqrt', '√a 平方根'], ['max', 'max(a,b)'], ['min', 'min(a,b)'], ['pow', 'a 的 b 次方'], ['round', 'round(a)']].map(([fn, label]) => (
          <button key={fn} className="exp-btn" onClick={() => run(fn)}>{label}</button>
        ))}
      </div>
      <div className="exp-out">{out}</div>
    </div>
  );
}
