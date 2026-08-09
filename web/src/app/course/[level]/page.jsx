import { readLevel, readRelated, LEVEL_CN } from '@/lib/courseData';
import { getMemberContext } from '@/lib/member';
import ProgressBar from './ProgressBar';
import CheckButton from './CheckButton';
import CourseMap from './CourseMap';
import LockedPanel from '@/components/LockedPanel';
import Experiments from '@/components/Experiments';
import CodeBlock from '@/components/experiments/CodeBlock';
import LessonQuiz from '@/components/experiments/LessonQuiz';
import RelatedQuestions from '@/components/RelatedQuestions';

export async function generateStaticParams() {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ level: String(id) }));
}

export default async function CoursePage({ params }) {
  const { level } = await params;
  const data = await readLevel(level);
  const { isMember } = await getMemberContext();
  const related = await readRelated(data.id);
  const levelName = LEVEL_CN[data.id] || `${data.id} 级`;
  const isFree = data.id === 0;
  const locked = !isFree && !isMember;
  const relatedByAnchor = {};
  for (const lesson of related.lessons || []) {
    relatedByAnchor[lesson.anchor] = lesson.questions || [];
  }

  return (
    <>
      <section className="course-hero" id="course-top">
        <p className="eyebrow">Dynamic Course</p>
        <h1>{data.emoji} {data.title}</h1>
        <p>{data.description}</p>
        <ProgressBar progressKey={data.progressKey} total={data.lessons.length} />
        <CourseMap lessons={data.lessons} progressKey={data.progressKey} />
      </section>

      {locked ? (
        <LockedPanel title={`${data.emoji} ${LEVEL_CN[data.id]}课程为会员专享`} />
      ) : (
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
                <RelatedQuestions questions={relatedByAnchor[lesson.anchor]} />
                <div className="lesson-actions">
                  <CheckButton progressKey={data.progressKey} index={index} />
                </div>
                <div className="lesson-pnav">
                  {index > 0 && (
                    <a className="pn-prev" href={`#${data.lessons[index - 1].anchor}`}>← 上一课</a>
                  )}
                  {index < data.lessons.length - 1 ? (
                    <a className="pn-next" href={`#${data.lessons[index + 1].anchor}`}>
                      下一课：{data.lessons[index + 1].title.replace(/^第 \d+ 课：/, '')} →
                    </a>
                  ) : (
                    <a className="pn-next" href="#course-top">🏆 本级别学完，返回顶部 ↑</a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!locked && (
        <section className="course-panel">
          <h2>🧪 互动实验</h2>
          <Experiments level={data.id} />
        </section>
      )}
    </>
  );
}
