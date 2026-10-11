import Link from 'next/link';
import { notFound } from 'next/navigation';
import LockedPanel from '@/components/LockedPanel';
import MockExam from '@/components/MockExam';
import { getMemberContext } from '@/lib/member';
import { loadPaper, toExamView } from '@/lib/papers';

export default async function MockExamPage({ params }) {
  const { session, level } = await params;
  const { isMember } = await getMemberContext();
  if (!isMember) return <LockedPanel title="模拟考为会员专享" />;
  const paper = await loadPaper(session, level);
  if (!paper) notFound();
  return (
    <div className="panel">
      <p><Link href="/papers">← 返回真题</Link></p>
      <MockExam session={session} level={Number(level)} exam={toExamView(paper)} />
    </div>
  );
}
