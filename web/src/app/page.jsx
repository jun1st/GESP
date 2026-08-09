'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const MODULES = [
  { name: '基础常识', emoji: '🧠', key: 'gesp_lv0_prog', total: 3, page: '/course/0', color: 'sky' },
  { name: '一级', emoji: '🎒', key: 'gesp_lv1_prog', total: 3, page: '/course/1', color: 'teal' },
  { name: '二级', emoji: '🚀', key: 'gesp_lv2_prog', total: 10, page: '/course/2', color: 'violet' },
  { name: '三级', emoji: '📘', key: 'gesp_lv3_prog', total: 6, page: '/course/3', color: 'sky' },
  { name: '四级', emoji: '📗', key: 'gesp_lv4_prog', total: 8, page: '/course/4', color: 'amber' },
  { name: '五级', emoji: '📙', key: 'gesp_lv5_prog', total: 8, page: '/course/5', color: 'rose' },
  { name: '六级', emoji: '📕', key: 'gesp_lv6_prog', total: 6, page: '/course/6', color: 'emerald' },
  { name: '七级', emoji: '📓', key: 'gesp_lv7_prog', total: 5, page: '/course/7', color: 'violet' },
  { name: '八级', emoji: '📔', key: 'gesp_lv8_prog', total: 8, page: '/course/8', color: 'indigo' }
];

function getArr(key, n) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved) && saved.length === n) return saved.map(Boolean);
    if (Array.isArray(saved)) return saved.map(Boolean).concat(new Array(n - saved.length).fill(false));
  } catch (e) {}
  return new Array(n).fill(false);
}

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('gesp_user_profile') || 'null');
      if (p && typeof p.name === 'string') setProfile(p);
    } catch (e) {}
    const loadProgress = () => {
      const state = MODULES.map((m) => {
        const arr = getArr(m.key, m.total);
        return { m, arr, done: arr.filter(Boolean).length };
      });
      setProgress(state);
    };
    loadProgress();
    window.addEventListener('gesp-progress', loadProgress);
    window.addEventListener('storage', loadProgress);
    return () => {
      window.removeEventListener('gesp-progress', loadProgress);
      window.removeEventListener('storage', loadProgress);
    };
  }, []);

  const login = (e) => {
    e.preventDefault();
    const clean = name.trim() || '小勇士';
    const p = { name: clean, savedAt: Date.now() };
    localStorage.setItem('gesp_user_profile', JSON.stringify(p));
    setProfile(p);
    window.dispatchEvent(new CustomEvent('gesp-data-changed', { detail: { key: 'gesp_user_profile' } }));
  };

  const logout = () => {
    localStorage.removeItem('gesp_user_profile');
    setProfile(null);
    window.dispatchEvent(new CustomEvent('gesp-data-changed', { detail: { key: 'gesp_user_profile' } }));
  };

  const state = progress || MODULES.map((m) => ({ m, arr: new Array(m.total).fill(false), done: 0 }));
  const total = state.reduce((s, x) => s + x.m.total, 0);
  const done = state.reduce((s, x) => s + x.done, 0);
  const pct = progress ? Math.round((done / total) * 100) : null;
  const firstIncomplete = state.find((x) => x.arr.indexOf(false) >= 0);
  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了，注意休息' : hour < 12 ? '早上好！' : hour < 18 ? '下午好！' : '晚上好！';

  return (
    <>
      <section className="landing-hero">
        <div>
          <span className="mascot">🏠</span>
          <p className="eyebrow">GESP C++ 1-8 级系统学习</p>
          <h1>{profile ? `${greet}，${profile.name}！` : '从第一次运行程序，到有节奏地通关 GESP。'}</h1>
          <p className="hero-copy">
            把官方考纲拆成孩子能每天完成的小关卡：先理解概念，再动手编程，最后用错题复习把知识补牢。
          </p>
          <div className="hero-actions">
            {profile ? (
              <button className="primary-cta" onClick={logout}>退出登录</button>
            ) : (
              <form className="login-card" onSubmit={login}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  placeholder="孩子昵称"
                />
                <button type="submit">登录学习</button>
              </form>
            )}
            <Link className="secondary-cta" href="/syllabus">查看官方考纲</Link>
            <Link className="secondary-cta" href="/papers">📚 真题资料库</Link>
          </div>
        </div>
        <aside className="hero-panel" aria-label="课程概览">
          <div>
            <b>{total} 课</b>
            <span>基础常识 + 1-8 级课程地图</span>
          </div>
          <div className="hero-stats">
            <div className="hs"><b>9</b><span>个级别</span></div>
            <div className="hs"><b>14</b><span>期官方真题</span></div>
            <div className="hs"><b>2646</b><span>道真题</span></div>
            <div className="hs"><b>∞</b><span>在线编译</span></div>
          </div>
          <div className="hero-progress">
            <div className="hp-row"><span>我的学习进度</span><b>{pct ?? 0}%</b></div>
            <div className="hp-track"><i style={{ width: (pct ?? 0) + '%' }} /></div>
          </div>
          <div className="mini-path">
            <i>基础</i><i>一级</i><i>二级</i><i>进阶</i>
          </div>
        </aside>
      </section>

      <section className="trust-grid" aria-label="核心价值">
        <article><span>01</span><h2>对齐官方考纲</h2><p>课程入口保留官方考纲和知识笔记，备考前先看清范围。</p></article>
        <article><span>02</span><h2>每日只走一步</h2><p>登录后优先推荐下一课，让孩子知道今天该学什么。</p></article>
        <article><span>03</span><h2>错题自动回流</h2><p>测验答错进入复习站，考前不用翻页面找薄弱点。</p></article>
        <article><span>04</span><h2>家长可看进度</h2><p>家长中心汇总进度、错题和备考节奏。</p></article>
      </section>

      <section id="pathPreview" className="path-preview">
        <div className="section-heading">
          <p className="eyebrow">Learning Path</p>
          <h2>三段式课程结构</h2>
          <p>先建基础，再完成一级二级核心考点，最后进入三至八级算法能力提升。</p>
        </div>
        <div className="path-cards">
          <Link href="/course/0"><b>基础启蒙</b><span>二进制、字节和存储单位</span></Link>
          <Link href="/course/1"><b>一级入门</b><span>变量、输入输出、分支循环和调试</span></Link>
          <Link href="/course/2"><b>二级巩固</b><span>网络、编码、流程图、多层结构</span></Link>
          <Link href="/courses"><b>三至八级进阶</b><span>数组、排序、递归、动态规划和图论</span></Link>
        </div>
      </section>

      {profile && (
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Student Dashboard</p>
            <h1>嗨，{profile.name}！</h1>
            <p>一次只学一课。完成打卡后，系统会继续推荐下一步。</p>
          </div>
          <div className="progress-card">
            <div><span>总闯关进度</span><b>{pct ?? 0}%</b></div>
            <div className="progress-track"><i style={{ width: (pct ?? 0) + '%' }} /></div>
            <p>已完成 {done} / {total} 课</p>
          </div>
        </section>
      )}

      {profile && firstIncomplete && (
        <section className="panel-card">
          <div className="section-heading compact"><h2>今天学什么</h2></div>
          <div className="next-lesson">
            <div>
              <span>{firstIncomplete.m.emoji} {firstIncomplete.m.name} · 第 {firstIncomplete.arr.indexOf(false) + 1} / {firstIncomplete.m.total} 课</span>
              <b>继续你的闯关之旅</b>
            </div>
            <Link href={firstIncomplete.m.page}>开始学习</Link>
          </div>
        </section>
      )}

      {profile && (
        <section className="route-section">
          <div className="section-heading compact"><h2>学习路线（1-8 级）</h2><p>学完一级再进下一级。</p></div>
          <div className="level-list">
            {state.map(({ m, arr, done: d }, i) => {
              const locked = i > 0 && state[i - 1].done < state[i - 1].m.total;
              const complete = d === m.total;
              return (
                <div className={'level-row' + (locked ? ' is-locked' : '')} key={m.key}>
                  <div className="level-icon">{m.emoji}</div>
                  <div className="level-main">
                    <b>{m.name}级</b>
                    <span>共 {m.total} 课</span>
                    <div className="level-track"><i style={{ width: (d / m.total) * 100 + '%' }} /></div>
                  </div>
                  <strong>{d}/{m.total}</strong>
                  {complete ? <em>已毕业</em> : <Link href={m.page}>{d > 0 ? '继续' : '开始'}</Link>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
