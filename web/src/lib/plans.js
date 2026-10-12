// 会员套餐：按 GESP Level 分档开通，每次开通一个季度（90 天）。
// 纯数据模块，不依赖数据库，服务端/客户端都可引用。
export const QUARTER_DAYS = 90;

export const TIERS = {
  L123: { label: '1-3 级', levels: [1, 2, 3] },
  L45: { label: '4-5 级', levels: [4, 5] },
  L67: { label: '6-7 级', levels: [6, 7] },
  L8: { label: '8 级', levels: [8] }
};

export const TIER_IDS = Object.keys(TIERS);

export function tierOfLevel(level) {
  const n = Number(level);
  return TIER_IDS.find((id) => TIERS[id].levels.includes(n)) || null;
}
