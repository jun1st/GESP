import { readLevel, LEVEL_CN } from '@/lib/courseData';
import ProgressBar from './ProgressBar';
import CheckButton from './CheckButton';
import Experiments from '@/components/Experiments';
import CodeBlock from '@/components/experiments/CodeBlock';
import LessonQuiz from '@/components/experiments/LessonQuiz';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ level: String(id) }));
}

export default async function CoursePage({ params }) {
  const { level } = await params;
  const data = await readLevel(level);
  const levelName = LEVEL_CN[data.id] || `${data.id} 级`;

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
              {!lesson.quiz && lesson.practice && (
                <div className="lesson-practice">
                  <b>{lesson.practice.title}</b>
                  <p>{lesson.practice.prompt}</p>
                </div>
              )}
              {(lesson.code || []).map((code, i) => (
                <CodeBlock key={i} code={code} title={i === 0 ? '💻 代码示例' : `💻 代码示例 ${i + 1}`} />
              ))}
              <LessonQuiz quiz={lesson.quiz} levelName={levelName} lessonTitle={lesson.title} />
              <div className="lesson-actions">
                <CheckButton progressKey={data.progressKey} index={index} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="course-panel">
        <h2>🧪 互动实验</h2>
        <Experiments level={data.id} />
      </section>
    </>
  );
}
