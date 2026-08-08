'use client';

import { useState } from 'react';

export default function AsciiEncoder() {
  const [text, setText] = useState('ABa0');

  return (
    <div className="exp-card">
      <h3>🔤 ASCII 编码器：每个字符都有编号</h3>
      <div className="exp-row">
        <label className="exp-label">打几个字符：
          <input className="exp-input" style={{ width: 200 }} value={text} maxLength="12"
            onChange={(e) => setText(e.target.value)} />
        </label>
      </div>
      <div className="chips2">
        {[...text].map((ch, i) => (
          <div key={i} className="chip1" style={{ width: 'auto', padding: '0 10px' }}>
            {ch}={ch.charCodeAt(0)}
          </div>
        ))}
      </div>
      <div className="exp-out">必背：空格 32、'0' 48、'A' 65、'a' 97；小写比大写大 32。</div>
    </div>
  );
}
