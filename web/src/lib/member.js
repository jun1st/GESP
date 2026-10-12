import { getSession } from './session';
import { findUserByPhone, getPlans, publicUser } from './auth';

const EMPTY = { user: null, isMember: false, levels: [], hasLevel: () => false };

// 服务端获取登录/会员上下文（页面级内容门禁用）
// isMember：任一档位有效；levels / hasLevel(n)：按 Level 判断是否已开通
export async function getMemberContext() {
  const session = await getSession();
  if (!session) return EMPTY;
  const user = await findUserByPhone(session.phone);
  if (!user) return EMPTY;
  const pub = publicUser(user, await getPlans(user.id));
  return {
    user,
    isMember: pub.isMember,
    levels: pub.levels,
    hasLevel: (level) => pub.levels.includes(Number(level)),
    public: pub
  };
}
