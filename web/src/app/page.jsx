import HomeApp from '@/components/HomeApp';
import { getLevelMeta } from '@/lib/courseData';
import { getMemberContext } from '@/lib/member';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { public: account } = await getMemberContext();
  return <HomeApp meta={await getLevelMeta()} account={account} />;
}
