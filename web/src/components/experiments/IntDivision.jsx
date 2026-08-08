'use client';

import { useState } from 'react';

export default function IntDivision() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(2);

  return (
    <div className="exp-card">
      <h3>🔢 类型转换：5 ÷ 2 到底等于几？</h3>
      <div className="exp-row">
        <label className="exp-label">a：<input className="exp-input" type="number" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
        <label className="exp-label">b：<input className="exp-input" type="number" value={b} onChange={(e) => setB(Number(e.target.value))} /></label>
      </div>
      <div className="exp-out">
        int a / b = {Math.floor(a / b)}（整数除法，小数被砍掉）<br />
        (double)a / b = {(a / b).toFixed(4)}（先转 double 才有小数）
      </div>
    </div>
  );
}
