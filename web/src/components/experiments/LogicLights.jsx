'use client';

import { useState } from 'react';

export default function LogicLights() {
  const [A, setA] = useState(true);
  const [B, setB] = useState(false);

  return (
    <div className="exp-card">
      <h3>💡 逻辑开关：与（&&）或（||）非（!）</h3>
      <div className="exp-row">
        <button className={'exp-btn' + (A ? ' go' : '')} onClick={() => setA(!A)}>A = {A ? '真' : '假'}</button>
        <button className={'exp-btn' + (B ? ' go' : '')} onClick={() => setB(!B)}>B = {B ? '真' : '假'}</button>
      </div>
      <div className="exp-out">
        <span className={'lamp' + (A && B ? ' on' : '')} /> A && B（两个都真才真）= {A && B ? '真' : '假'}<br />
        <span className={'lamp' + (A || B ? ' on' : '')} /> A || B（一个真就真）= {A || B ? '真' : '假'}<br />
        <span className={'lamp' + (!A ? ' on' : '')} /> !A（真变假，假变真）= {!A ? '真' : '假'}
      </div>
    </div>
  );
}
