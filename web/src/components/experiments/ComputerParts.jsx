'use client';

import { useState } from 'react';

const PARTS = [
  ['🧠', 'CPU', '电脑的大脑！所有"想一想、算一算"都是它负责。'],
  ['🧮', '内存', '临时工作台：正在用的程序和数据放这里，速度快，但一断电就"忘光光"。'],
  ['💾', '硬盘', '大仓库：所有文件、游戏、照片都存这里，断电也不丢。'],
  ['⌨️', '键盘鼠标', '输入设备：把我们的命令"送进"电脑。'],
  ['🖥️', '显示器', '输出设备：把电脑的结果"展示"给我们看。'],
  ['🪟', '操作系统', '管理电脑的"大管家"，常见的有 Windows、Linux、macOS。']
];

export default function ComputerParts() {
  const [sel, setSel] = useState(0);
  const [part, icon, desc] = PARTS[sel];

  return (
    <div className="exp-card">
      <h3>🖥️ 认识电脑的"身体"（点一点）</h3>
      <div className="exp-row">
        {PARTS.map(([ic, name], i) => (
          <button key={name} className={'exp-btn' + (i === sel ? ' go' : '')} onClick={() => setSel(i)}>
            {ic} {name}
          </button>
        ))}
      </div>
      <div className="exp-out">{icon} {part}：{desc}</div>
    </div>
  );
}
