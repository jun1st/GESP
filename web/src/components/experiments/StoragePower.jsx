'use client';

import { useState } from 'react';

export default function StoragePower() {
  const [off, setOff] = useState(false);

  return (
    <div className="exp-card">
      <h3>🗄️ 断电实验：谁的记忆会飞走？</h3>
      <div className="exp-out" style={{ fontSize: 16, lineHeight: 2 }}>
        💾 RAM 内存条：<span style={{ opacity: off ? 0 : 1 }}>{off ? '记忆飞走了…' : '●●●●●●'}</span><br />
        ⚡ Cache 高速缓存：<span style={{ opacity: off ? 0 : 1 }}>{off ? '也没了…' : '●●●'}</span><br />
        📼 ROM 只读存储器：{off ? '📼 还在这里！' : '●●●'}
      </div>
      <div className="exp-row">
        <button className={'exp-btn' + (off ? '' : ' go')} onClick={() => setOff(!off)}>
          {off ? '🔌 恢复供电' : '🔌 断电试试'}
        </button>
      </div>
      <div className="exp-out">口诀：RAM 会忘、ROM 不忘、Cache 最快最贵。</div>
    </div>
  );
}
