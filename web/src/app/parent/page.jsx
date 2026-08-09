import ParentApp from '@/components/ParentApp';
import LockedPanel from '@/components/LockedPanel';
import { getMemberContext } from '@/lib/member';

export default async function ParentPage() {
  const { isMember } = await getMemberContext();
  if (!isMember) {
    return <LockedPanel title="家长中心为会员专享" />;
  }
  return <ParentApp />;
}
