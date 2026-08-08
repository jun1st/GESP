'use client';

import { useState } from 'react';

export default function FlowChart() {
  const [rain, setRain] = useState(null);

  return (
    <div className="exp-card">
      <h3>🧭 流程图：小明出门要不要带伞？</h3>
      <div className="flow">
        <div className="fnode walk">🏁 开始</div>
        <div className="farrow">↓</div>
        <div className="fnode io walk">📝 看天气</div>
        <div className="farrow">↓</div>
        <div className={'fdiamond' + (rain !== null ? ' walk' : '')}><span>☔ 下雨了吗?</span></div>
        <div className="farrow">↓</div>
        <div className="fbranches">
          <div className={'fnode process' + (rain === true ? ' walk' : '')}>🌂 带伞<br /><small>（是）</small></div>
          <div className={'fnode process' + (rain === false ? ' walk' : '')}>☀️ 不带伞<br /><small>（否）</small></div>
        </div>
        <div className="farrow">↓</div>
        <div className="fnode walk">🎉 结束</div>
      </div>
      <div className="exp-row">
        <button className="exp-btn go" onClick={() => setRain(true)}>🌧️ 下雨了！</button>
        <button className="exp-btn" onClick={() => setRain(false)}>☀️ 没下雨</button>
      </div>
      <div className="exp-out">菱形 = 判断框，两条路（是/否）→ 分支结构。</div>
    </div>
  );
}
