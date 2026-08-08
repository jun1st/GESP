'use client';

import { useState } from 'react';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function BinaryByteBuilder() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  const toggle = (i) => setBits((b) => b.map((v, k) => (k === i ? (v ? 0 : 1) : v)));
  const random = () => setBits(WEIGHTS.map(() => (Math.random() < 0.5 ? 0 : 1)));
  const reset = () => setBits([0, 0, 0, 0, 0, 0, 0, 0]);

  const bin = bits.join('');
  const dec = parseInt(bin, 2);

  return (
    <div className="exp-card">
      <h3>⚡ 点开关，拼出一个字节（8 bit = 1 byte）</h3>
      <div className="bits">
        {bits.map((v, i) => (
          <div key={i} className={'bit' + (v ? ' on' : '')} onClick={() => toggle(i)}>
            <span className="bv">{v}</span>
            <span className="bw">{WEIGHTS[i]}</span>
          </div>
        ))}
      </div>
      <div className="exp-out">二进制：{bin} ＝ 十进制的 {dec}</div>
      <div className="exp-row">
        <button className="exp-btn go" onClick={random}>🎲 随机来一个</button>
        <button className="exp-btn" onClick={reset}>🧹 全部熄灭</button>
      </div>
    </div>
  );
}
