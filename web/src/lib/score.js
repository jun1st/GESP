// 模拟考折算百分制（纯函数，服务端与浏览器共用）
// 官方分值：单选 30、判断 20、编程 50；通过线 60、优秀线 75。

export const WEIGHTS = { single: 30, judge: 20, program: 50 };
export const PASS_LINE = 60;
export const EXCELLENT_LINE = 75;
export const SELF_VALUE = { full: 1, part: 0.5, none: 0 };
export const SELF_LABEL = { full: '做对了', part: '部分对', none: '没做出来' };

// sections: { single:{score,full}, judge:{score,full}, programCount }
// self: { [no]: 'full'|'part'|'none' }
// 返回 objective（客观部分得分，满分 50 或按实际题型折算）、total（自评完成后才有）
export function computeTotal(sections, self) {
  const frac = (s) => (s && s.full > 0 ? s.score / s.full : null);
  let earned = 0;
  let available = 0;
  for (const type of ['single', 'judge']) {
    const f = frac(sections[type]);
    if (f !== null) {
      earned += f * WEIGHTS[type];
      available += WEIGHTS[type];
    }
  }
  const objective = Math.round(earned * 10) / 10;
  const objectiveMax = available;

  const count = sections.programCount || 0;
  const rated = self ? Object.keys(self).filter((k) => SELF_VALUE[self[k]] !== undefined).length : 0;
  const selfDone = count === 0 || rated >= count;

  if (!selfDone) return { objective, objectiveMax, selfDone, total: null };

  if (count > 0) {
    const sum = Object.values(self || {}).reduce((s, v) => s + (SELF_VALUE[v] ?? 0), 0);
    earned += (sum / count) * WEIGHTS.program;
    available += WEIGHTS.program;
  }
  const total = available > 0 ? Math.round((earned / available) * 1000) / 10 : null;
  return { objective, objectiveMax, selfDone, total };
}
