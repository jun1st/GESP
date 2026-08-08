'use client';

import { useState } from 'react';

export default function GradeBranch() {
  const [score, setScore] = useState(75);
  const pass = score >= 60;

  return (
    <div className="exp-card">
      <h3>🌿 分支结构：及格了吗？</h3>
      <div className="exp-row">
        <label className="exp-label">分数：
          <input className="exp-range" type="range" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} />
          <b>{score}</b>
        </label>
      </div>
      <div className="exp-out" style={{ fontSize: 28, fontWeight: 900, textAlign: 'center' }}>
        {pass ? '及格 ✅' : '不及格 ❌'}
      </div>
      <pre className="exp-out" style={{ fontFamily: 'monospace' }}>
{`if (score >= 60)
    cout << "及格";
else
    cout << "不及格";`}
      </pre>
    </div>
  );
}
