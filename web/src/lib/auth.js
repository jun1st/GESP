import bcrypt from 'bcryptjs';
import { query, run } from './db';
import { TIERS, TIER_IDS, QUARTER_DAYS } from './plans';

const DAY_MS = 24 * 60 * 60 * 1000;

export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

export async function findUserByPhone(phone) {
  const rows = await query('SELECT id, phone, password_hash, membership_expires_at, created_at FROM users WHERE phone = $1', [phone]);
  return rows[0] || null;
}

export async function createUser(phone, password) {
  const hash = await bcrypt.hash(password, 10);
  await run(
    'INSERT INTO users (phone, password_hash, created_at) VALUES ($1, $2, $3)',
    [phone, hash, new Date().toISOString()]
  );
  return findUserByPhone(phone);
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

export async function changePassword(userId, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);
  await run('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
}

// 读取某用户各档位的到期时间：{ L123: iso, ... }
export async function getPlans(userId) {
  const rows = await query('SELECT tier, expires_at FROM user_plans WHERE user_id = $1', [userId]);
  const plans = {};
  for (const r of rows) if (TIERS[r.tier]) plans[r.tier] = r.expires_at;
  return plans;
}

function isFuture(iso) {
  return Boolean(iso) && new Date(iso).getTime() > Date.now();
}

// 当前有效的档位列表。旧版"全站会员"（users.membership_expires_at）仍有效时视为全部档位。
export function activeTiers(user, plans) {
  if (isFuture(user?.membership_expires_at)) return [...TIER_IDS];
  return TIER_IDS.filter((id) => isFuture(plans?.[id]));
}

export function accessibleLevels(user, plans) {
  const levels = activeTiers(user, plans).flatMap((id) => TIERS[id].levels);
  return levels.sort((a, b) => a - b);
}

// 开通一个季度：已有效则从原到期日顺延，否则从现在起算
export async function activatePlan(phone, tier) {
  if (!TIERS[tier]) return null;
  const user = await findUserByPhone(phone);
  if (!user) return null;
  const plans = await getPlans(user.id);
  const base = isFuture(plans[tier]) ? new Date(plans[tier]).getTime() : Date.now();
  const expires = new Date(base + QUARTER_DAYS * DAY_MS).toISOString();
  await run(
    `INSERT INTO user_plans (user_id, tier, expires_at) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, tier) DO UPDATE SET expires_at = excluded.expires_at`,
    [user.id, tier, expires]
  );
  return { user, tier, expiresAt: expires };
}

export function publicUser(user, plans = {}) {
  const tiers = TIER_IDS.map((id) => {
    const legacy = isFuture(user.membership_expires_at);
    const expiresAt = plans[id] || (legacy ? user.membership_expires_at : null);
    const exp = Math.max(
      plans[id] ? new Date(plans[id]).getTime() : 0,
      legacy ? new Date(user.membership_expires_at).getTime() : 0
    );
    return {
      tier: id,
      label: TIERS[id].label,
      levels: TIERS[id].levels,
      active: exp > Date.now(),
      expiresAt: exp ? new Date(exp).toISOString() : expiresAt
    };
  });
  const levels = accessibleLevels(user, plans);
  return {
    phone: user.phone,
    isMember: levels.length > 0,
    levels,
    tiers,
    createdAt: user.created_at
  };
}
