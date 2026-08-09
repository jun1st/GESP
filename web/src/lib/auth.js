import bcrypt from 'bcryptjs';
import { query, run } from './db';

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

export function isActiveMember(user) {
  if (!user || !user.membership_expires_at) return false;
  return new Date(user.membership_expires_at).getTime() > Date.now();
}

export async function activateMembership(phone, months) {
  const user = await findUserByPhone(phone);
  if (!user) return null;
  const now = Date.now();
  const base = isActiveMember(user)
    ? new Date(user.membership_expires_at).getTime()
    : now;
  const expires = new Date(base + months * 30 * DAY_MS).toISOString();
  await run('UPDATE users SET membership_expires_at = $1 WHERE id = $2', [expires, user.id]);
  return findUserByPhone(phone);
}

export function publicUser(user) {
  return {
    phone: user.phone,
    isMember: isActiveMember(user),
    membershipExpiresAt: user.membership_expires_at || null,
    createdAt: user.created_at
  };
}
