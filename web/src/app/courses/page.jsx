import Link from 'next/link';
import { listLevels, readFundamentals } from '@/lib/courseData';
import { getMemberContext } from '@/lib/member';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const levels = await listLevels();
  const fundamentals = await readFundamentals();
  const { isMember } = await getMemberContext();
  return (
    <>
      <section className="course-hero">
        <p className="eyebrow">Course Map</p>
        <h1>GESP C++ 课程地图</h1>
        <p>从基础常识到八级综合训练，所有课程按官方考纲组织。</p>
      </section>
      <section className="course-panel">
        <h2>选择级别</h2>
        <div className="practice-grid">
          <Link className="practice-card" href="/fundamentals">
            <b>{fundamentals.emoji} {fundamentals.title}</b>
            <p>{fundamentals.description}</p>
            <span>{fundamentals.lessons.length} 课 · 免费</span>
          </Link>
          {levels.map((level) => (
            <Link key={level.id} className="practice-card" href={`/course/${level.id}`}>
              <b>{level.emoji} {level.title}</b>
              <p>{level.description}</p>
              <span>{level.lessonCount} 课{isMember ? '' : ' · 会员'}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
