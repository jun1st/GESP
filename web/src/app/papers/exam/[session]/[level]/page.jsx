import Link from 'next/link';
import { notFound } from 'next/navigation';
import LockedPanel from '@/components/LockedPanel';
import MockExam from '@/components/MockExam';
import { getMemberContext } from '@/lib/member';
import { loadPaper, toExamView } from '@/lib/papers';

export default async function MockExamPage({ params }) {
  const { session, level } = await params;
  const { hasLevel } = await getMemberContext();
  if (!hasLevel(level)) return <LockedPanel title={`${level} 级模拟考需开通对应级别会员`} />;
  const paper = await loadPaper(session, level);
  if (!paper) notFound();
  return (
    <div className="panel">
      <p><Link href="/papers">← 返回真题</Link></p>
      <MockExam session={session} level={Number(level)} exam={toExamView(paper)} />
    </div>
  );
}
