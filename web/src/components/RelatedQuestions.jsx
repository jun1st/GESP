'use client';

import { useState } from 'react';

const TYPE_LABEL = { single: '单选', judge: '判断', program: '编程' };

function RQItem({ q }) {
  const [show, setShow] = useState(false);
  const hasAnswer = Boolean(q.answer);
  return (
    <div className="rq-item">
      <div className="rq-head">
        <span className="rq-tag">{TYPE_LABEL[q.type]}</span>
        <span className="rq-batch">{q.batch}</span>
        {q.title && <b>{q.title}</b>}
      </div>
      <div className="rq-text">{q.text}</div>
      {q.type === 'single' && q.options.length > 0 && (
        <div className="rq-opts">
          {q.options.map((o, i) => (
            <span key={i} className="rq-opt">{'ABCD'[i]}. {o}</span>
          ))}
        </div>
      )}
      <button type="button" className={'rq-toggle' + (show ? ' open' : '')} onClick={() => setShow(!show)}>
        {show ? '🙈 收起' : '💡 答案与解析'}
      </button>
      {show && (
        <div className="rq-answer">
          {hasAnswer && <p><b>答案：</b>{q.answer}</p>}
          {q.point && <p><b>考点：</b>{q.point}</p>}
          {q.analysis && <p><b>解析：</b>{q.analysis}</p>}
          {q.outline && <p><b>题目大意：</b>{q.outline}</p>}
          {q.thinking && <p><b>解题思路：</b>{q.thinking}</p>}
          {q.program && (
            <div className="rq-code">
              <p><b>参考程序：</b></p>
              <pre>{q.program}</pre>
            </div>
          )}
          {!hasAnswer && !q.analysis && !q.thinking && <p className="rq-note">官方未公布本题答案/解析。</p>}
        </div>
      )}
    </div>
  );
}

export default function RelatedQuestions({ questions }) {
  const [open, setOpen] = useState(false);
  if (!questions || questions.length === 0) return null;
  return (
    <div className="rq-wrap">
      <button type="button" className={'rq-summary' + (open ? ' open' : '')} onClick={() => setOpen(!open)}>
        📚 本节相关真题（{questions.length} 道）
        <span>{open ? '▴ 收起' : '▾ 展开'}</span>
      </button>
      {open && (
        <div className="rq-list">
          {questions.map((q, i) => (
            <RQItem key={i} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}
