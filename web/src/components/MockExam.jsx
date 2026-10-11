'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeTotal, SELF_LABEL, PASS_LINE, EXCELLENT_LINE } from '@/lib/score';

const EXAM_SECONDS = 90 * 60;
const TYPE_LABEL = { single: '单选题', judge: '判断题', program: '编程题' };
const JUDGE_LABEL = { T: '对', F: '错' };

function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${m}:${s}` : `${m}:${s}`;
}

export default function MockExam({ session, level, exam }) {
  // 扁平化题目序列：单选 → 判断 → 编程
  const items = useMemo(
    () => [
      ...exam.single.map((q) => ({ ...q, type: 'single' })),
      ...exam.judge.map((q) => ({ ...q, type: 'judge' })),
      ...exam.program.map((q) => ({ ...q, type: 'program' }))
    ],
    [exam]
  );

  const [phase, setPhase] = useState('intro'); // intro | exam | result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({ single: {}, judge: {} });
  const [flags, setFlags] = useState({});
  const [left, setLeft] = useState(EXAM_SECONDS);
  const [result, setResult] = useState(null);
  const [attemptId, setAttemptId] = useState('');
  const [self, setSelf] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [onlyWrong, setOnlyWrong] = useState(false);
  const startedAt = useRef(0);
  const submitted = useRef(false);

  const cur = items[idx];
  const key = (it) => `${it.type}:${it.no}`;
  const isAnswered = (it) => it.type !== 'program' && Boolean(answers[it.type]?.[it.no]);
  const objective = items.filter((it) => it.type !== 'program');
  const answeredCount = objective.filter(isAnswered).length;

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/papers/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          level,
          answers,
          durationSec: Math.round((Date.now() - startedAt.current) / 1000)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');
      setResult({ ...data.result, durationSec: data.attempt.durationSec });
      setAttemptId(data.attempt.id);
      setPhase('result');
      setConfirming(false);
      setIdx(0);
    } catch (e) {
      submitted.current = false;
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [session, level, answers]);

  // 编程题自评：立即更新本地，再同步到云端
  const rate = useCallback(
    async (no, value) => {
      const next = { ...self, [no]: value };
      setSelf(next);
      try {
        await fetch('/api/papers/grade', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: attemptId, self: next })
        });
      } catch (e) {
        setError('自评保存失败，请检查网络');
      }
    },
    [self, attemptId]
  );

  // 倒计时
  useEffect(() => {
    if (phase !== 'exam') return undefined;
    const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // 时间到自动交卷
  useEffect(() => {
    if (phase === 'exam' && left === 0) submit();
  }, [left, phase, submit]);

  // 防止误关页面
  useEffect(() => {
    if (phase !== 'exam') return undefined;
    const h = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [phase]);

  const pick = useCallback(
    (type, no, value) => {
      if (phase !== 'exam') return;
      setAnswers((a) => ({ ...a, [type]: { ...a[type], [no]: value } }));
    },
    [phase]
  );

  // 键盘：←/→ 切题，A-D / T F（或 对 错 对应 1 2）选答案
  useEffect(() => {
    if (phase === 'intro') return undefined;
    const h = (e) => {
      if (confirming) return;
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(items.length - 1, i + 1));
      else if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      else if (phase === 'exam' && cur?.type === 'single' && /^[a-dA-D]$/.test(e.key)) {
        const n = cur.options.length || 4;
        if (e.key.toUpperCase().charCodeAt(0) - 65 < n) {
          pick('single', cur.no, e.key.toUpperCase());
        }
      } else if (phase === 'exam' && cur?.type === 'judge') {
        if (e.key === '1') pick('judge', cur.no, 'T');
        if (e.key === '2') pick('judge', cur.no, 'F');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [phase, cur, items.length, pick, confirming]);

  // ---------- 开考前 ----------
  if (phase === 'intro') {
    const scorable = exam.scorable.single + exam.scorable.judge;
    return (
      <div className="mx-intro">
        <div className="mx-intro-emoji">🎯</div>
        <h2>模拟考 · {session.replace('-', ' 年 ')} 月 · {level} 级</h2>
        <div className="mx-stats">
          <div><b>{exam.total.single}</b><span>单选题</span></div>
          <div><b>{exam.total.judge}</b><span>判断题</span></div>
          <div><b>{exam.total.program}</b><span>编程题</span></div>
          <div><b>{EXAM_SECONDS / 60}</b><span>分钟</span></div>
        </div>
        <ul className="mx-rules">
          <li>按官方分值折算：单选 30 分、判断 20 分、编程题 50 分，满分 100，60 分通过、75 分优秀。</li>
          <li>单选、判断由系统自动判分；编程题交卷后看参考程序，由你自己评分。</li>
          <li>本卷可评分 {scorable} 题 / 共 {exam.total.single + exam.total.judge} 道客观题，没有标准答案的题不计入总分。</li>
          <li>考试中看不到答案；时间到会自动交卷。</li>
          <li>快捷键：← → 切题，A-D 选择，1 / 2 判断对 / 错。</li>
        </ul>
        <button
          type="button"
          className="mx-btn primary big"
          onClick={() => {
            startedAt.current = Date.now();
            setPhase('exam');
          }}
        >
          ▶ 开始考试
        </button>
      </div>
    );
  }

  const r = phase === 'result' && cur.type !== 'program'
    ? result[cur.type].find((x) => x.no === cur.no)
    : null;
  const rp = phase === 'result' && cur.type === 'program'
    ? result.program.find((x) => x.no === cur.no)
    : null;

  const resultOf = (it) =>
    it.type === 'program' ? null : result[it.type].find((x) => x.no === it.no);

  function cellClass(it, i) {
    let c = 'mx-cell';
    if (i === idx) c += ' current';
    if (phase === 'exam') {
      if (isAnswered(it)) c += ' done';
      if (flags[key(it)]) c += ' flag';
    } else {
      const x = resultOf(it);
      if (!x) c += self[it.no] ? ' ok' : ' na';
      else if (!x.scored) c += ' na';
      else c += x.correct ? ' ok' : ' bad';
    }
    return c;
  }

  const totals = result ? computeTotal(result.sections, self) : null;
  const pct = result && result.full ? Math.round((result.score / result.full) * 100) : 0;
  const sectionStart = (type) => items.findIndex((it) => it.type === type);

  return (
    <div className="mx">
      <div className="mx-topbar">
        {phase === 'exam' ? (
          <>
            <span className={'mx-timer' + (left < 300 ? ' warn' : '')}>⏱ {fmt(left)}</span>
            <div className="mx-progress">
              <i style={{ width: `${(answeredCount / objective.length) * 100}%` }} />
            </div>
            <span className="mx-count">已答 {answeredCount}/{objective.length}</span>
            <button type="button" className="mx-btn danger" onClick={() => setConfirming(true)}>交卷</button>
          </>
        ) : (
          <>
            <b>📋 成绩回顾</b>
            <label className="mx-filter">
              <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
              只看错题
            </label>
          </>
        )}
      </div>

      {phase === 'result' && (
        <div className="mx-result">
          <div className="mx-ring" style={{ '--p': pct }}>
            <b>{result.score}</b>
            <span>/ {result.full}</span>
          </div>
          <div className="mx-result-txt">
            <h3>{pct >= 80 ? '🎉 太棒了！' : pct >= 60 ? '👍 继续加油！' : '💪 再练练，下次更好！'}</h3>
            <p>正确率 {pct}% · 用时 {fmt(result.durationSec)}</p>
            <p className="pb-note">仅统计有标准答案的题。</p>
            <p>
              客观题 <b>{totals.objective}</b> / {totals.objectiveMax} 分
              {totals.total !== null ? (
                <>
                  ，折算总分 <b>{totals.total}</b> / 100
                  {totals.total >= EXCELLENT_LINE ? '（达到优秀线）' : totals.total >= PASS_LINE ? '（达到通过线）' : `（离通过线 ${PASS_LINE} 分还差 ${Math.round((PASS_LINE - totals.total) * 10) / 10} 分）`}
                </>
              ) : (
                <>，请在编程题里自评后查看总分</>
              )}
            </p>
          </div>
          <a className="mx-btn" href={`/papers/exam/${session}/${level}/`}>🔁 再考一次</a>
        </div>
      )}

      <div className="mx-body">
        <div className="mx-main">
          <div className="pb-qhead">
            <span className="pb-qno">{cur.no}</span>
            <b>{TYPE_LABEL[cur.type]}</b>
            {cur.title && <span className="pb-qtitle">：{cur.title}</span>}
            {r && (r.scored
              ? <span className={'mx-badge ' + (r.correct ? 'ok' : 'bad')}>{r.correct ? '✅ 答对了' : '❌ 答错了'}</span>
              : <span className="mx-badge na">⚪ 无标准答案</span>)}
            {phase === 'exam' && cur.type !== 'program' && (
              <button
                type="button"
                className={'mx-flagbtn' + (flags[key(cur)] ? ' on' : '')}
                onClick={() => setFlags((f) => ({ ...f, [key(cur)]: !f[key(cur)] }))}
              >
                🚩 {flags[key(cur)] ? '已标记' : '标记'}
              </button>
            )}
          </div>

          <div className="mx-qtext">{cur.text}</div>

          {cur.type === 'single' && (
            <div className="mx-options">
              {cur.options.length === 0 && (
                <div className="pb-note">（本题选项在原卷中是图片，暂无法显示，请按原卷选项 A–D 作答）</div>
              )}
              {(cur.options.length ? cur.options : ['', '', '', '']).map((o, i) => {
                const letter = 'ABCD'[i];
                let cls = 'mx-option';
                if (answers.single[cur.no] === letter) cls += ' picked';
                if (r?.scored && letter === r.answer) cls += ' right';
                if (r?.scored && letter === r.mine && !r.correct) cls += ' wrong';
                return (
                  <button
                    type="button"
                    key={letter}
                    className={cls}
                    disabled={phase !== 'exam'}
                    onClick={() => pick('single', cur.no, letter)}
                  >
                    <span className="mx-letter">{letter}</span>
                    <span>{o || `选项 ${letter}`}</span>
                  </button>
                );
              })}
            </div>
          )}

          {cur.type === 'judge' && (
            <div className="mx-options judge">
              {['T', 'F'].map((v) => {
                let cls = 'mx-option';
                if (answers.judge[cur.no] === v) cls += ' picked';
                if (r?.scored && JUDGE_LABEL[v] === r.answer) cls += ' right';
                if (r?.scored && v === r.mine && !r.correct) cls += ' wrong';
                return (
                  <button
                    type="button"
                    key={v}
                    className={cls}
                    disabled={phase !== 'exam'}
                    onClick={() => pick('judge', cur.no, v)}
                  >
                    <span className="mx-letter">{v === 'T' ? '✓' : '✗'}</span>
                    <span>{JUDGE_LABEL[v]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {cur.type === 'program' && phase === 'exam' && (
            <p className="pb-note">编程题交卷后可查看官方题目大意、思路和参考程序，并自己评分。</p>
          )}

          {r && (
            <div className="mx-explain">
              <p>
                <b>你的答案：</b>
                {r.mine ? (cur.type === 'judge' ? JUDGE_LABEL[r.mine] : r.mine) : '未作答'}
                {r.scored && <>　<b>正确答案：</b>{r.answer}</>}
              </p>
              {r.analysis && <p><b>解析：</b>{r.analysis}</p>}
              {!r.scored && <p className="pb-note">这道题暂时没有标准答案，不计分。</p>}
            </div>
          )}
          {rp && (
            <div className="mx-explain">
              {rp.outline && <p><b>题目大意：</b>{rp.outline}</p>}
              {rp.thinking && <p><b>解题思路：</b>{rp.thinking}</p>}
              {rp.program && <pre>{rp.program}</pre>}
              {!rp.outline && !rp.thinking && !rp.program && <p className="pb-note">暂无官方解析。</p>}
              <div className="mx-self">
                <b>对照参考程序，你这题：</b>
                {['full', 'part', 'none'].map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={'mx-btn' + (self[cur.no] === v ? ' primary' : '')}
                    onClick={() => rate(cur.no, v)}
                  >
                    {SELF_LABEL[v]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mx-nav">
            <button type="button" className="mx-btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← 上一题</button>
            <span>{idx + 1} / {items.length}</span>
            <button type="button" className="mx-btn primary" disabled={idx === items.length - 1} onClick={() => setIdx(idx + 1)}>下一题 →</button>
          </div>
        </div>

        <aside className="mx-side">
          <h4>答题卡</h4>
          {['single', 'judge', 'program'].map((type) =>
            sectionStart(type) >= 0 ? (
              <div key={type} className="mx-sec">
                <div className="mx-sec-title">{TYPE_LABEL[type]}</div>
                <div className="mx-grid">
                  {items.map((it, i) => {
                    if (it.type !== type) return null;
                    if (phase === 'result' && onlyWrong) {
                      const x = resultOf(it);
                      if (!x || !x.scored || x.correct) return null;
                    }
                    return (
                      <button type="button" key={key(it)} className={cellClass(it, i)} onClick={() => setIdx(i)}>
                        {it.no}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null
          )}
          <div className="mx-legend">
            {phase === 'exam' ? (
              <>
                <span><i className="done" />已答</span>
                <span><i className="flag" />标记</span>
                <span><i />未答</span>
              </>
            ) : (
              <>
                <span><i className="ok" />对</span>
                <span><i className="bad" />错</span>
                <span><i className="na" />不计分</span>
              </>
            )}
          </div>
        </aside>
      </div>

      {confirming && (
        <div className="mx-modal" role="dialog">
          <div className="mx-modal-card">
            <h3>确认交卷？</h3>
            <p>
              已答 {answeredCount} / {objective.length} 题
              {answeredCount < objective.length && <b className="mx-warn">，还有 {objective.length - answeredCount} 题未作答</b>}
              {Object.values(flags).some(Boolean) && <>，另有 {Object.values(flags).filter(Boolean).length} 题被标记</>}。
            </p>
            {error && <p className="pb-note">{error}</p>}
            <div className="mx-modal-actions">
              <button type="button" className="mx-btn" onClick={() => setConfirming(false)}>继续答题</button>
              <button type="button" className="mx-btn danger" disabled={submitting} onClick={submit}>
                {submitting ? '提交中…' : '确认交卷'}
              </button>
            </div>
          </div>
        </div>
      )}
      {error && !confirming && phase === 'exam' && <p className="pb-note">{error}</p>}
    </div>
  );
}
