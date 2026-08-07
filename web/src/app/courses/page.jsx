import Link from 'next/link';
import { listLevels } from '@/lib/courseData';

export const dynamic = 'force-static';

export default async function CoursesPage() {
  const levels = await listLevels();
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
          {levels.map((level) => (
            <Link key={level.id} className="practice-card" href={`/course/${level.id}`}>
              <b>{level.emoji} {level.title}</b>
              <p>{level.description}</p>
              <span>{level.lessonCount} 课</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
