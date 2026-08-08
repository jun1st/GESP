'use client';

import { useState } from 'react';

export default function ArithmeticCalc() {
  const [a, setA] = useState(7);
  const [b, setB] = useState(3);

  return (
    <div className="exp-card">
      <h3>➗ 算术运算：加、减、乘、整除、求余</h3>
      <div className="exp-row">
        <label className="exp-label">a：<input className="exp-input" type="number" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
        <label className="exp-label">b：<input className="exp-input" type="number" value={b} onChange={(e) => setB(Number(e.target.value))} /></label>
      </div>
      <div className="exp-out">
        {a} + {b} = {a + b}<br />
        {a} - {b} = {a - b}<br />
        {a} × {b} = {a * b}<br />
        {a} ÷ {b} = {Math.floor(a / b)} … 余 {a % b}（整数除法结果还是整数）
      </div>
    </div>
  );
}
