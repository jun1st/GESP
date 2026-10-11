'use client';

import { PASS_LINE, EXCELLENT_LINE } from '@/lib/score';
import { LEVEL_NAMES } from '@/lib/levelNames';

const W = 640;
const H = 220;
const PAD = { l: 34, r: 12, t: 12, b: 24 };

// 模拟考折算总分趋势；画出通过线与优秀线，不做过级预测
export default function ScoreTrend({ trend, attempts }) {
  const pending = attempts.filter((a) => a.total === null).length;
  if (trend.length === 0) {
    return (
      <p className="pb-note">
        还没有带总分的模拟考。{pending > 0 && `有 ${pending} 次模拟考的编程题还没有自评，自评后才会算出总分。`}
      </p>
    );
  }
  const x = (i) => PAD.l + (trend.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i / (trend.length - 1)) * (W - PAD.l - PAD.r));
  const y = (v) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b);
  const pts = trend.map((t, i) => `${x(i)},${y(t.total)}`).join(' ');
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="st-chart" role="img" aria-label="模拟考成绩趋势">
        {[0, 25, 50, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
            <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#6b7280">{v}</text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(PASS_LINE)} y2={y(PASS_LINE)} stroke="#f59e0b" strokeDasharray="5 4" />
        <text x={W - PAD.r} y={y(PASS_LINE) - 4} textAnchor="end" fontSize="11" fill="#b45309">通过线 {PASS_LINE}</text>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(EXCELLENT_LINE)} y2={y(EXCELLENT_LINE)} stroke="#10b981" strokeDasharray="5 4" />
        <text x={W - PAD.r} y={y(EXCELLENT_LINE) - 4} textAnchor="end" fontSize="11" fill="#047857">优秀线 {EXCELLENT_LINE}</text>
        <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth="2" />
        {trend.map((t, i) => (
          <g key={t.id || i}>
            <circle cx={x(i)} cy={y(t.total)} r="4" fill="#2563eb" />
            <text x={x(i)} y={y(t.total) - 8} textAnchor="middle" fontSize="11" fill="#1e3a8a">{t.total}</text>
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#6b7280">
              {LEVEL_NAMES[t.level]} {t.session.slice(2)}
            </text>
          </g>
        ))}
      </svg>
      {pending > 0 && <p className="pb-note">另有 {pending} 次模拟考的编程题还没有自评，自评后才会出现在图里。</p>}
    </div>
  );
}
