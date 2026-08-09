import { getSession } from './session';
import { findUserByPhone, isActiveMember, publicUser } from './auth';

// 服务端获取登录/会员上下文（页面级内容门禁用）
export async function getMemberContext() {
  const session = await getSession();
  if (!session) return { user: null, isMember: false };
  const user = await findUserByPhone(session.phone);
  if (!user) return { user: null, isMember: false };
  return { user, isMember: isActiveMember(user), public: publicUser(user) };
}
