import { readFundamentals, readLevel } from './courseData';

// 按当前课程 JSON 课数生成家长页备考周计划（约 8 周，一级+二级入门）
export async function buildParentWeeksPlan() {
  const fund = await readFundamentals();
  const lv1 = await readLevel(1);
  const lv2 = await readLevel(2);
  const t1 = (lessons, from, to) =>
    lessons
      .slice(from, to)
      .map((l) => l.title.replace(/^第\s*\d+\s*课[:：]\s*/, ''))
      .join('、') || '复习';

  const f = fund.lessons.length;
  const a = lv1.lessons.length;
  const b = lv2.lessons.length;
  const w2 = Math.ceil(a / 2);
  const w3 = a - w2;
  const w4 = Math.ceil(b / 3);
  const w5 = Math.ceil((b - w4) / 2);
  const w6 = b - w4 - w5;

  return [
    `第 1 周：基础常识 ${f} 课（${t1(fund.lessons, 0, f)}）`,
    `第 2 周：一级 ${w2} 课（${t1(lv1.lessons, 0, w2)}）`,
    `第 3 周：一级 ${w3} 课（${t1(lv1.lessons, w2, a)}）+ 复习`,
    `第 4 周：二级 ${w4} 课（${t1(lv2.lessons, 0, w4)}）`,
    `第 5 周：二级 ${w5} 课（${t1(lv2.lessons, w4, w4 + w5)}）`,
    `第 6 周：二级 ${w6} 课（${t1(lv2.lessons, w4 + w5, b)}）`,
    '第 7 周：复习站刷错题 + 真题样例/模拟考',
    '第 8 周：总复习 + 按薄弱项回课'
  ];
}
