import ReviewApp from '@/components/ReviewApp';
import LockedPanel from '@/components/LockedPanel';
import { getMemberContext } from '@/lib/member';

export default async function ReviewPage() {
  const { isMember } = await getMemberContext();
  if (!isMember) {
    return <LockedPanel title="复习站为会员专享" />;
  }
  return <ReviewApp />;
}
