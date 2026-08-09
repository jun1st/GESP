'use client';

import { useState } from 'react';

function recordWrong(item) {
  try {
    const list = JSON.parse(localStorage.getItem('gesp_wrong') || '[]');
    list.push(Object.assign({ time: Date.now() }, item));
    localStorage.setItem('gesp_wrong', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('gesp-data-changed', { detail: { key: 'gesp_wrong' } }));
  } catch (e) {
    /* localStorage 不可用时静默跳过 */
  }
}

export default function LessonQuiz({ quiz, levelName, lessonTitle }) {
  if (!quiz || quiz.length === 0) return null;
  return (
    <div className="lesson-quiz">
      <p className="quiz-title">📝 考一考：点一点，立刻知道对错！答错的题会进复习站。</p>
      {quiz.map((q, i) => (
        <QuizItem key={i} q={q} levelName={levelName} lessonTitle={lessonTitle} />
      ))}
    </div>
  );
}

function QuizItem({ q, levelName, lessonTitle }) {
  const [done, setDone] = useState(null);

  const choose = (j) => {
    if (done) return;
    const correct = j === q.answer;
    if (!correct) {
      recordWrong({ lv: levelName, lesson: lessonTitle, q: q.q, o: q.options, a: q.answer, chosen: j });
    }
    setDone({ chosen: j, correct });
  };

  return (
    <div className="quiz-item">
      <div className="quiz-q">{q.q}</div>
      <div className="quiz-opts">
        {q.options.map((t, j) => {
          let cls = 'quiz-opt';
          if (done) {
            if (j === q.answer) cls += ' right';
            else if (j === done.chosen) cls += ' wrong';
            else cls += ' dim';
          }
          return (
            <button key={j} type="button" className={cls} disabled={!!done} onClick={() => choose(j)}>
              {'ABCD'[j]}. {t}
            </button>
          );
        })}
      </div>
      {done && (
        <div className={'quiz-feedback ' + (done.correct ? 'ok' : 'no')}>
          {done.correct ? '✅ 答对啦！' : '❌ 已记入复习站～'} {q.explain}
        </div>
      )}
    </div>
  );
}
