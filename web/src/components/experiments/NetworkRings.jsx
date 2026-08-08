'use client';

import { useState } from 'react';

const RINGS = [
  ['🏠 家', '局域网 LAN：一栋楼、一个学校那么大。'],
  ['🏙️ 城市', '城域网 MAN：覆盖一座城市。'],
  ['🌍 世界', '广域网 WAN：全国、全球，就是互联网！']
];

export default function NetworkRings() {
  const [sel, setSel] = useState(-1);

  return (
    <div className="exp-card">
      <h3>📡 网络范围：局域网 &lt; 城域网 &lt; 广域网</h3>
      <div className="rings">
        <div className={'ring r1' + (sel === 0 ? ' on' : '')} onClick={() => setSel(0)}><span>🏠 家</span></div>
        <div className={'ring r2' + (sel === 1 ? ' on' : '')} onClick={() => setSel(1)}><span>🏙️ 城市</span></div>
        <div className={'ring r3' + (sel === 2 ? ' on' : '')} onClick={() => setSel(2)}><span>🌍 世界</span></div>
      </div>
      <div className="exp-out">{sel >= 0 ? RINGS[sel][0] + '：' + RINGS[sel][1] : '点圆圈看看它是哪种网络～'}</div>
    </div>
  );
}
