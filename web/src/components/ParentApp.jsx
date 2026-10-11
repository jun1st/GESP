'use client';

import { useEffect, useState } from 'react';
import WeakSpots, { useReport } from './WeakSpots';
import ScoreTrend from './ScoreTrend';
import { LEVEL_NAMES } from '@/lib/levelNames';

const MODULE_NAMES = [
  '🧠 基础常识', '🎒 一级', '🚀 二级', '📘 三级', '📗 四级', '📙 五级', '📕 六级', '📓 七级', '📔 八级'
];

export default function ParentApp({ meta, weeks }) {
  const [rows, setRows] = useState([]);
  const [wrong, setWrong] = useState(0);
  const { report, error } = useReport();

  useEffect(() => {
    const data = MODULE_NAMES.map((name, i) => {
      const level = { progressKey: meta[i].progressKey, lessons: { length: meta[i].total } };
      try {
        const saved = JSON.parse(localStorage.getItem(level.progressKey) || '[]');
        const done = Array.isArray(saved) ? saved.filter(Boolean).length : 0;
        return { name, total: level.lessons.length, done };
      } catch (e) {
        return { name, total: level.lessons.length, done: 0 };
      }
    });
    setRows(data);
    try {
      const w = JSON.parse(localStorage.getItem('gesp_wrong') || '[]');
      setWrong(Array.isArray(w) ? w.length : 0);
    } catch (e) {}
  }, [meta]);

  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const totalAll = rows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <div className="panel">
        <h2>📊 学习进度总览</h2>
        <div className="total">总进度：{totalDone} / {totalAll} 课（{Math.round((totalDone / totalAll) * 100)}%）</div>
        <table>
          <thead>
            <tr><th>模块</th><th>进度</th><th>完成</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td><div className="bar"><i style={{ width: (r.done / r.total) * 100 + '%' }} /></div></td>
                <td>{r.done} / {r.total} 课{r.done === r.total ? ' ✅' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="callout info">
          {wrong > 0 ? `📚 错题本里有 ${wrong} 道错题，建议每周去「复习站」重做一遍。` : '🎉 错题本是空的，继续保持！'}
        </div>
      </div>
      <div className="panel">
        <h2>📈 模拟考成绩</h2>
        {report ? (
          <>
            <ScoreTrend trend={report.trend} attempts={report.attempts} />
            {report.attempts.length > 0 && (
              <table>
                <thead>
                  <tr><th>时间</th><th>试卷</th><th>客观题得分</th><th>折算总分</th></tr>
                </thead>
                <tbody>
                  {report.attempts.slice(0, 10).map((a, i) => (
                    <tr key={a.id || i}>
                      <td>{new Date(a.at).toLocaleDateString('zh-CN')}</td>
                      <td>{a.session} {LEVEL_NAMES[a.level]}</td>
                      <td>{a.objective}</td>
                      <td>{a.total === null ? '待自评编程题' : a.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p className="pb-note">{error || '加载中…'}</p>
        )}
      </div>
      <div className="panel">
        <h2>🎯 薄弱项</h2>
        <WeakSpots report={report} error={error} />
      </div>
      <div className="panel">
        <h2>🗓️ 8 周备考计划（按当前课表）</h2>
        <div className="plan">
          {(weeks || []).map((w) => <div className="wk" key={w}><b>{w.split('：')[0]}</b>{w.split('：')[1]}</div>)}
        </div>
      </div>
      <div className="panel">
        <h2>💡 给家长的小建议</h2>
        <ul style={{ paddingLeft: 20, fontSize: 14.5 }}>
          <li>先体验再理论：让孩子先点"运行"看程序跑起来，兴趣最重要。</li>
          <li>错题是宝贝：每周带孩子去一次「复习站」重做错题。</li>
          <li>编程题一定要动手：用编程练习场亲手敲代码。</li>
          <li>小学阶段每次 30~60 分钟，累了就停。</li>
        </ul>
      </div>
    </>
  );
}
