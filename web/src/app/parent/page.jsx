'use client';

import { useEffect, useState } from 'react';

const MODULES = [
  ['🧠 基础常识', 'gesp_lv0_prog', 3],
  ['🎒 一级', 'gesp_lv1_prog', 9],
  ['🚀 二级', 'gesp_lv2_prog', 10],
  ['📘 三级', 'gesp_lv3_prog', 6],
  ['📗 四级', 'gesp_lv4_prog', 8],
  ['📙 五级', 'gesp_lv5_prog', 8],
  ['📕 六级', 'gesp_lv6_prog', 6],
  ['📓 七级', 'gesp_lv7_prog', 5],
  ['📔 八级', 'gesp_lv8_prog', 8]
];

const WEEKS = [
  '第 1 周：基础常识 + 一级 1~2 课',
  '第 2 周：一级 3~5 课（变量/输入输出/算术）',
  '第 3 周：一级 6~7 课（关系逻辑/分支）',
  '第 4 周：一级 8~9 课 + 期末闯关',
  '第 5 周：二级 1~3 课（存储/网络/语言）',
  '第 6 周：二级 4~6 课（流程图/ASCII/类型转换）',
  '第 7 周：二级 7~9 课（分支/循环/数学函数）',
  '第 8 周：期末闯关 + 复习站刷错题 + 真题练习'
];

export default function ParentPage() {
  const [rows, setRows] = useState([]);
  const [wrong, setWrong] = useState(0);

  useEffect(() => {
    const data = MODULES.map(([name, key, total]) => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        const done = Array.isArray(saved) ? saved.filter(Boolean).length : 0;
        return { name, total, done };
      } catch (e) {
        return { name, total, done: 0 };
      }
    });
    setRows(data);
    try {
      const w = JSON.parse(localStorage.getItem('gesp_wrong') || '[]');
      setWrong(Array.isArray(w) ? w.length : 0);
    } catch (e) {}
  }, []);

  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const totalAll = rows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <div className="panel">
        <h2>📊 学习进度总览</h2>
        <div className="total">总进度：{totalDone} / {totalAll} 课（{Math.round((totalDone / totalAll) * 100)}%）</div>
        <table>
          <tr><th>模块</th><th>进度</th><th>完成</th></tr>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td><div className="bar"><i style={{ width: (r.done / r.total) * 100 + '%' }} /></div></td>
              <td>{r.done} / {r.total} 课{r.done === r.total ? ' ✅' : ''}</td>
            </tr>
          ))}
        </table>
        <div className="callout info">
          {wrong > 0 ? `📚 错题本里有 ${wrong} 道错题，建议每周去「复习站」重做一遍。` : '🎉 错题本是空的，继续保持！'}
        </div>
      </div>
      <div className="panel">
        <h2>🗓️ 8 周备考计划（一级 → 二级）</h2>
        <div className="plan">
          {WEEKS.map((w) => <div className="wk" key={w}><b>{w.split('：')[0]}</b>{w.split('：')[1]}</div>)}
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
