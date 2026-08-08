'use client';

import { useState } from 'react';

const UNITS = [
  ['1 B', '8', '刚好能装一个英文字母（A）。'],
  ['1 KB', '1024', '大概能装半页文字（约 500 个汉字）。'],
  ['1 MB', '1024 × 1024', '大概是一张手机照片的大小！'],
  ['1 GB', '1024 × 1024 × 1024', '大概是一部 1 小时的电影。'],
  ['1 TB', '1024 × 1024 × 1024 × 1024', '大概能装几百部电影！']
];

export default function StorageUnits() {
  const [i, setI] = useState(1);
  const u = UNITS[i];

  return (
    <div className="exp-card">
      <h3>📦 存储单位：B、KB、MB、GB、TB（每级 ×1024）</h3>
      <div className="exp-row">
        <label className="exp-label">文件大小：
          <input className="exp-range" type="range" min="0" max="4" value={i}
            onChange={(e) => setI(Number(e.target.value))} />
        </label>
        <b>{u[0]}</b>
      </div>
      <div className="exp-out">{u[0]} = {u[1]} B，{u[2]}</div>
    </div>
  );
}
