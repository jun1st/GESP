import Link from 'next/link';
import { readLevel } from '@/lib/courseData';
import ProgressBar from './ProgressBar';
import CheckButton from './CheckButton';
import Experiments from '@/components/Experiments';

// 互动实验页（二进制开关、编译器练习场等）暂由旧版页面提供，迁移完成后移除。
const LEGACY_BASE = 'https://jun1st.github.io/GESP';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ level: String(id) }));
}

export default async function CoursePage({ params }) {
  const { level } = await params;
  const data = await readLevel(level);

  return (
    <>
      <section className="course-hero">
        <p className="eyebrow">Dynamic Course</p>
        <h1>{data.emoji} {data.title}</h1>
        <p>{data.description}</p>
        <ProgressBar progressKey={data.progressKey} total={data.lessons.length} />
        <div className="course-map">
          {data.lessons.map((lesson, index) => (
            <a key={lesson.anchor} href={`#${lesson.anchor}`}>
              <b>{index + 1}. {lesson.title.replace(/^第 \d+ 课：/, '')}</b>
              <span>打卡后点亮</span>
            </a>
          ))}
        </div>
      </section>

      <section className="course-panel">
        <h2>课程内容</h2>
        <div className="lesson-list">
          {data.lessons.map((lesson, index) => (
            <article key={lesson.anchor} className="lesson-card" id={lesson.anchor}>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
              <div className="lesson-tags">
                {(lesson.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <p><b>目标：</b>{lesson.goal}</p>
              <ul className="lesson-blocks">
                {(lesson.blocks || []).map((block, i) => <li key={i}>{block}</li>)}
              </ul>
              <div className="lesson-practice">
                <b>{lesson.practice?.title || '练习'}</b>
                <p>{lesson.practice?.prompt || '完成本课配套练习。'}</p>
              </div>
              <div className="lesson-actions">
                <CheckButton progressKey={data.progressKey} index={index} />
                <a href={`${LEGACY_BASE}/${data.sourcePage}#${lesson.anchor}`} target="_blank" rel="noopener">
                  打开互动版
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {data.practiceLinks?.length > 0 && (
        <section className="course-panel">
          <h2>练习入口</h2>
          <div className="practice-grid">
                {data.practiceLinks.map((link) => (
                  <div className="practice-card" key={link.title}>
                    <b>{link.title}</b>
                    <p>{link.description}</p>
                    <a href={`${LEGACY_BASE}/${link.href}`} target="_blank" rel="noopener">打开</a>
                  </div>
                ))}
          </div>
        </section>
      )}

      <section className="course-panel">
        <h2>🧪 互动实验</h2>
        <Experiments level={data.id} />
      </section>
    </>
  );
}
