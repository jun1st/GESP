'use client';

import { useState } from 'react';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function BinaryConverter() {
  const [dec, setDec] = useState(13);
  const [bin, setBin] = useState('1101');

  const decChange = (v) => {
    const n = Math.max(0, Math.min(255, Math.floor(Number(v) || 0)));
    setDec(n);
    setBin(n.toString(2).padStart(8, '0'));
  };
  const binChange = (s) => {
    const clean = s.replace(/[^01]/g, '').slice(-8);
    setBin(clean);
    setDec(clean ? parseInt(clean, 2) : 0);
  };

  return (
    <div className="exp-card">
      <h3>🔄 十进制 ↔ 二进制互转</h3>
      <div className="exp-row">
        <label className="exp-label">十进制：
          <input className="exp-input" type="number" min="0" max="255" value={dec}
            onChange={(e) => decChange(e.target.value)} />
        </label>
        <label className="exp-label">二进制（最多 8 位）：
          <input className="exp-input" value={bin} maxLength="8"
            onChange={(e) => binChange(e.target.value)} />
        </label>
      </div>
      <div className="chips2">
        {WEIGHTS.map((w, i) => (
          <div key={i} className={'chip1' + (bin[i] === '1' ? ' on' : '')}>{bin[i] || '0'}</div>
        ))}
      </div>
      <div className="exp-out">二进制 {bin} ＝ 十进制 {dec}</div>
    </div>
  );
}
