'use client';

import { useState } from 'react';

export default function LoopPattern() {
  const [pattern, setPattern] = useState('triangle');
  const [n, setN] = useState(5);

  const cells = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let on = false;
      if (pattern === 'triangle') on = j <= i;
      if (pattern === 'x') on = i === j || i + j === n - 1;
      if (pattern === 'square') on = i === 0 || i === n - 1 || j === 0 || j === n - 1;
      cells.push({ i, j, on });
    }
  }

  return (
    <div className="exp-card">
      <h3>🔁 嵌套循环：外层管行，内层管列</h3>
      <div className="exp-row">
        <label className="exp-label">图形：
          <select className="exp-input" value={pattern} onChange={(e) => setPattern(e.target.value)}>
            <option value="triangle">三角形</option>
            <option value="square">正方形边框</option>
            <option value="x">X 字矩阵</option>
          </select>
        </label>
        <label className="exp-label">大小：
          <input className="exp-range" type="range" min="3" max="9" value={n} onChange={(e) => setN(Number(e.target.value))} />
          <b>{n}</b>
        </label>
      </div>
      <div className="gridout" style={{ gridTemplateColumns: 'repeat(' + n + ', 26px)' }}>
        {cells.map((c, k) => (
          <div key={k} className="gcell" style={{ background: c.on ? '#5e60ce' : '#eef2ff', color: c.on ? '#fff' : '#c7d2fe' }}>
            {c.on ? '#' : '.'}
          </div>
        ))}
      </div>
      <pre className="exp-out" style={{ fontFamily: 'monospace' }}>
{`for (int i = 0; i < ${n}; i++) {
    for (int j = 0; j < ${n}; j++) {
        if (条件(i, j)) cout << "#";
        else cout << ".";
    }
}`}
      </pre>
    </div>
  );
}
