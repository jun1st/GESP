'use client';

import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const TYPE_LABEL = { single: '单选题', judge: '判断题', program: '编程题' };

function QCard({ q, type }) {
  const [show, setShow] = useState(false);
  const hasAnswer = Boolean(q.answer);
  const hasAnalysis = Boolean(q.analysis || q.thinking || q.outline);
  return (
    <div className="pb-question">
      <div className="pb-qhead">
        <span className="pb-qno">{q.no}</span>
        <b>{TYPE_LABEL[type]}</b>
        {q.title && <span className="pb-qtitle">：{q.title}</span>}
        {q.batch && <span className="pb-batch">{q.batch}</span>}
      </div>
      <div className="pb-qtext">{q.text}</div>
      {type === 'single' && (
        <div className="pb-opts">
          {q.options.length > 0 ? (
            q.options.map((o, i) => (
              <div key={i} className="pb-opt">{'ABCD'[i]}. {o}</div>
            ))
          ) : (
            <div className="pb-note">（本题选项为图片，暂无法显示）</div>
          )}
        </div>
      )}
      <button
        type="button"
        className={'pb-toggle' + (show ? ' open' : '')}
        onClick={() => setShow(!show)}
      >
        {show ? '🙈 收起答案' : hasAnswer ? '👀 看答案' : '👀 查看'}
      </button>
      {show && (
        <div className="pb-answer">
          <p className="pb-ans-line">
            <b>答案：</b>
            {hasAnswer ? (
              type === 'program' ? '见下方解析' : q.answer
            ) : (
              <span className="pb-note">官方未公布答案</span>
            )}
          </p>
          {q.point && <p className="pb-point"><b>考纲知识点：</b>{q.point}</p>}
          {hasAnalysis ? (
            <>
              {q.analysis && <p className="pb-analysis"><b>解析：</b>{q.analysis}</p>}
              {q.outline && <p className="pb-analysis"><b>题目大意：</b>{q.outline}</p>}
              {q.thinking && <p className="pb-analysis"><b>解题思路：</b>{q.thinking}</p>}
              {q.program && (
                <div className="pb-code">
                  <p><b>参考程序：</b></p>
                  <pre>{q.program}</pre>
                </div>
              )}
            </>
          ) : (
            <p className="pb-note">暂无官方解析（可到真题 PDF 查看）。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PapersBrowser({ batches }) {
  const [batch, setBatch] = useState(batches[batches.length - 1]?.batch || '');
  const [level, setLevel] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const current = batches.find((b) => b.batch === batch) || {};
  const levels = current.levels || [];

  useEffect(() => {
    if (levels.length && !levels.includes(level)) setLevel(String(levels[0]));
  }, [batch, levels, level]);

  useEffect(() => {
    if (!batch || !level) return;
    setLoading(true);
    fetch(`${BASE}/data/papers/${batch}/level-${level}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [batch, level]);

  const counts = {
    single: data?.single?.length || 0,
    judge: data?.judge?.length || 0,
    program: data?.program?.length || 0
  };

  return (
    <div className="pb-wrap">
      <div className="pb-controls">
        <label>
          批次：
          <select value={batch} onChange={(e) => setBatch(e.target.value)}>
            {batches.map((b) => (
              <option key={b.batch} value={b.batch}>
                {b.label}{b.hasAnalysis ? '（含解析）' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          级别：
          <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={!levels.length}>
            {levels.map((l) => (
              <option key={l} value={String(l)}>{l} 级</option>
            ))}
          </select>
        </label>
        <span className="pb-count">
          单选 {counts.single} 题 · 判断 {counts.judge} 题 · 编程 {counts.program} 题
        </span>
      </div>

      {loading && <div className="pb-loading">加载中…</div>}
      {!loading && data && (
        <div className="pb-sections">
          {(['single', 'judge', 'program']).map((type) =>
            (data[type] || []).length ? (
              <section key={type} className="pb-section">
                <h3>{TYPE_LABEL[type]}（{data[type].length} 题）</h3>
                {data[type].map((q, i) => (
                  <QCard key={i} q={q} type={type} />
                ))}
              </section>
            ) : null
          )}
        </div>
      )}
      {!loading && !data && <div className="pb-note">该批次暂时没有题目数据。</div>}
    </div>
  );
}
