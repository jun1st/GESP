import ParentApp from '@/components/ParentApp';
import LockedPanel from '@/components/LockedPanel';
import { getMemberContext } from '@/lib/member';
import { getLevelMeta } from '@/lib/courseData';
import { buildParentWeeksPlan } from '@/lib/parentPlan';

export default async function ParentPage() {
  const { isMember } = await getMemberContext();
  if (!isMember) {
    return <LockedPanel title="家长中心为会员专享" />;
  }
  const [meta, weeks] = await Promise.all([getLevelMeta(), buildParentWeeksPlan()]);
  return <ParentApp meta={meta} weeks={weeks} />;
}
