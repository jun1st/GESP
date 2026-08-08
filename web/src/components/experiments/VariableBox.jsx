'use client';

import { useState } from 'react';

const TYPES = [
  ['int', '整数'],
  ['long long', '大整数'],
  ['double', '小数'],
  ['char', '字符'],
  ['bool', '真假']
];

export default function VariableBox() {
  const [name, setName] = useState('age');
  const [type, setType] = useState('int');
  const [value, setValue] = useState('10');

  return (
    <div className="exp-card">
      <h3>📦 变量：给数据做"有名字的盒子"</h3>
      <div className="exp-row">
        <label className="exp-label">名字：
          <input className="exp-input" value={name} maxLength="12" onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="exp-label">类型：
          <select className="exp-input" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map(([t, label]) => <option key={t} value={t}>{t} {label}</option>)}
          </select>
        </label>
        <label className="exp-label">值：
          <input className="exp-input" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
      </div>
      <div className="exp-out">💡 {type} {name} = {value}；变量要先定义（做盒子），再使用（放东西）！</div>
    </div>
  );
}
