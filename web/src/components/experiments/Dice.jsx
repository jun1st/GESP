'use client';

import { useState } from 'react';

export default function Dice() {
  const [face, setFace] = useState('🎲');

  return (
    <div className="exp-card">
      <h3>🎲 掷骰子 = rand()%6+1</h3>
      <div className="exp-row">
        <button className="exp-btn go" onClick={() => setFace('🎲 ' + (Math.floor(Math.random() * 6) + 1))}>掷骰子！</button>
      </div>
      <div className="exp-out" style={{ fontSize: 30 }}>{face}</div>
    </div>
  );
}
