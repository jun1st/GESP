'use client';

import Link from 'next/link';
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
      </div>
      <div className="pb-qtext">{q.text}</div>
      {type === 'single' && (
        <div className="pb-opts">
          {q.options.length > 0 ? (
            q.options.map((o, i) => (
              <div key={i} className="pb-opt">{'ABCD'[i]}. {o}</div>
            ))
          ) : (
            <div className="pb-note">（选项在原卷中为图片，请对照 PDF 或模拟考中按 A–D 作答）</div>
          )}
        </div>
      )}
      <button
        type="button"
        className={'pb-toggle' + (show ? ' open' : '')}
        onClick={() => setShow(!show)}
      >
        {show ? '收起' : hasAnswer ? '答案与解析' : '查看'}
      </button>
      {show && (
        <div className="pb-answer">
          <p className="pb-ans-line">
            <b>答案：</b>
            {hasAnswer ? (type === 'program' ? '见下方解析' : q.answer) : <span className="pb-note">暂无</span>}
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
            <p className="pb-note">暂无官方文字解析。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PapersBrowser({ sessions, sample = false, ownedLevels = [] }) {
  const [session, setSession] = useState(sessions[sessions.length - 1]?.batch || '');
  const [level, setLevel] = useState('');
  const [browse, setBrowse] = useState(sample);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const current = sessions.find((b) => b.batch === session) || {};
  const levels = sample ? [1, 2, 3, 4, 5, 6, 7, 8] : current.levels || [];

  useEffect(() => {
    if (levels.length && !levels.includes(Number(level))) setLevel(String(levels[0]));
  }, [session, levels, level]);

  useEffect(() => {
    if (!browse || !session || !level) return;
    setLoading(true);
    const qs = sample || !owned ? `sample=1&level=${level}` : `session=${session}&level=${level}`;
    fetch(`${BASE}/api/papers/view?${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [browse, session, level, sample, owned]);

  const counts = {
    single: data?.single?.length || 0,
    judge: data?.judge?.length || 0,
    program: data?.program?.length || 0
  };

  const owned = sample || ownedLevels.includes(Number(level));
  const examHref = session && level ? `/papers/exam/${session}/${level}/` : '#';

  return (
    <div className="pb-wrap">
      <div className="papers-picker">
        {!sample && <label>
          <span>考季</span>
          <select value={session} onChange={(e) => setSession(e.target.value)}>
            {[...sessions].reverse().map((b) => (
              <option key={b.batch} value={b.batch}>
                {b.label}{b.hasAnalysis ? ' · 含解析' : ''}
              </option>
            ))}
          </select>
        </label>}
        <label>
          <span>Level</span>
          <div className="papers-levels">
            {levels.map((l) => (
              <button
                type="button"
                key={l}
                className={'papers-level-chip' + (String(l) === level ? ' on' : '')}
                onClick={() => setLevel(String(l))}
              >
                {l} 级
              </button>
            ))}
          </div>
        </label>
      </div>

      {level && !sample && !owned && (
        <p className="callout info papers-member-cta">
          你尚未开通 {level} 级所在档位（1-3 / 4-5 / 6-7 / 8 级分档开通，每次一个季度），下方仅显示样例题。请到 <Link href="/account">我的账号</Link> 查看并联系管理员开通。
        </p>
      )}

      {level && !sample && owned && (
        <div className="papers-actions">
          <Link className="mx-btn primary big" href={examHref}>开始模拟考</Link>
          <button
            type="button"
            className="mx-btn"
            onClick={() => setBrowse((v) => !v)}
          >
            {browse ? '收起题目' : '查阅试卷与解析'}
          </button>
        </div>
      )}

      {browse && level && (
        <>
          {(sample || !owned) && data?.batch && (
            <p className="pb-count papers-meta">
              样例：{data.batch.replace('-', ' 年 ')} 月 {level} 级的前 {data.single.length} 道单选题。开通会员可查看全部试卷并参加模拟考。
            </p>
          )}
          {!sample && owned && <p className="pb-count papers-meta">
            本卷：单选 {counts.single || '—'} · 判断 {counts.judge || '—'} · 编程 {counts.program || '—'}
            {current.hasAnalysis && ' · 部分题目附官方解析'}
          </p>}
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
          {!loading && !data && <div className="pb-note">暂无题目数据。</div>}
        </>
      )}
    </div>
  );
}
