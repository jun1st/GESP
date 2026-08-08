'use client';

import { useState } from 'react';

export default function SwitchBreak() {
  const [noBreak, setNoBreak] = useState(false);
  const seq = noBreak ? 'B C D' : 'B';

  return (
    <div className="exp-card">
      <h3>🎮 switch 大冒险：忘写 break 会怎样？</h3>
      <div className="exp-row">
        <label className="exp-label">
          <input type="checkbox" checked={noBreak} onChange={(e) => setNoBreak(e.target.checked)} /> 去掉所有 break
        </label>
      </div>
      <pre className="exp-out" style={{ fontFamily: 'monospace' }}>
{`switch (x) {          // x = 8
    case 9: cout << "A"; ${noBreak ? '// 没有 break' : 'break;'}
    case 8: cout << "B"; ${noBreak ? '// 没有 break' : 'break;'}
    case 7: cout << "C"; ${noBreak ? '// 没有 break' : 'break;'}
    default: cout << "D";
}`}
      </pre>
      <div className="exp-out">输出：{seq}{noBreak ? '（穿透了！）' : ''}</div>
    </div>
  );
}
