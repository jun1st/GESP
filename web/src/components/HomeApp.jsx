'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// 课数 / 进度 key 由服务端从课程数据派生后传入（meta），不在客户端直接引用课程 JSON
const MODULES_RAW = [
  { name: '基础常识', emoji: '🧠', meta: 0, page: '/fundamentals', color: 'sky' },
  { name: '一级', emoji: '🎒', meta: 1, page: '/course/1', color: 'teal' },
  { name: '二级', emoji: '🚀', meta: 2, page: '/course/2', color: 'violet' },
  { name: '三级', emoji: '📘', meta: 3, page: '/course/3', color: 'sky' },
  { name: '四级', emoji: '📗', meta: 4, page: '/course/4', color: 'amber' },
  { name: '五级', emoji: '📙', meta: 5, page: '/course/5', color: 'rose' },
  { name: '六级', emoji: '📕', meta: 6, page: '/course/6', color: 'emerald' },
  { name: '七级', emoji: '📓', meta: 7, page: '/course/7', color: 'violet' },
  { name: '八级', emoji: '📔', meta: 8, page: '/course/8', color: 'indigo' }
];

function buildModules(meta) {
  return MODULES_RAW.map(({ meta: levelIndex, ...rest }) => ({
    ...rest,
    meta: levelIndex,
    key: meta[levelIndex].progressKey,
    total: meta[levelIndex].total
  }));
}

function viplockedLabel(vipLocked, levelIndex) {
  if (levelIndex === 0) return ' · 免费';
  return vipLocked ? ' · 会员专享' : '';
}

function getArr(key, n) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved) && saved.length === n) return saved.map(Boolean);
    if (Array.isArray(saved)) return saved.map(Boolean).concat(new Array(n - saved.length).fill(false));
  } catch (e) {}
  return new Array(n).fill(false);
}

// account：服务端 /api/account/me 同款公开字段；null 表示未登录
export default function HomeApp({ meta, account }) {
  const MODULES = useMemo(() => buildModules(meta), [meta]);
  const isMember = Boolean(account?.isMember);
  const ownsLevel = (n) => Boolean(account?.levels?.includes(n));
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
  }, [MODULES]);

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

  const lockedNote = (m) => (m.meta >= 1 && !ownsLevel(m.meta) ? '会员' : '');

  return (
    <div className="home">
      <section className="home-hero">
        <p className="eyebrow">GESP C++ 1-8 级</p>
        <h1>{profile ? `${greet}，${profile.name}` : '把 GESP 拆成每天一小步'}</h1>
        <p className="hero-copy">按官方考纲分级学习：先懂概念，再动手编程，错题自动回流复习。</p>
        <div className="hero-actions">
          {profile ? (
            <button className="secondary-cta" onClick={logout}>退出昵称登录</button>
          ) : (
            <form className="login-card" onSubmit={login}>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} placeholder="孩子昵称" />
              <button type="submit">开始学习</button>
            </form>
          )}
          <Link className="secondary-cta" href="/papers">真题资料库</Link>
          <Link className="secondary-cta" href="/syllabus">官方考纲</Link>
          {account ? (
            <span className="home-member-badge">
              {isMember ? <span className="vip-badge">会员</span> : <span className="free-badge">未开通 · <Link href="/account">去开通</Link></span>}
            </span>
          ) : (
            <span className="home-member-badge free-badge">1–8 级与完整真题为会员专享 · <Link href="/account">登录 / 开通</Link></span>
          )}
        </div>
      </section>

      <section className="home-stats" aria-label="内容概览">
        <div><b>{total}</b><span>节课程</span></div>
        <div><b>14</b><span>期官方真题</span></div>
        <div><b>2646</b><span>道真题</span></div>
        <div><b>{pct ?? 0}%</b><span>我的进度（{done}/{total}）</span></div>
      </section>

      {profile && firstIncomplete && (
        <section className="next-lesson">
          <div>
            <span>下一步 · {firstIncomplete.m.name}{firstIncomplete.m.meta === 0 ? '' : '级'} 第 {firstIncomplete.arr.indexOf(false) + 1} / {firstIncomplete.m.total} 课</span>
            <b>继续学习</b>
          </div>
          {firstIncomplete.m.meta >= 1 && !ownsLevel(firstIncomplete.m.meta) ? (
            <Link href="/account">开通会员</Link>
          ) : (
            <Link href={firstIncomplete.m.page}>开始</Link>
          )}
        </section>
      )}

      <section>
        <div className="section-heading"><h2>学习路线</h2><p>基础常识免费；学完一级再进下一级。</p></div>
        <div className="level-list">
          {state.map(({ m, done: d }, i) => {
            const routeLocked = Boolean(profile) && i > 0 && state[i - 1].done < state[i - 1].m.total;
            const vipLocked = m.meta >= 1 && !ownsLevel(m.meta);
            const complete = d === m.total;
            return (
              <div className={'level-row' + (routeLocked || vipLocked ? ' is-locked' : '')} key={m.key}>
                <div className="level-main">
                  <b>{m.name}{m.meta === 0 ? '' : '级'}</b>
                  <span>共 {m.total} 课</span>
                  <div className="level-track"><i style={{ width: (d / m.total) * 100 + '%' }} /></div>
                </div>
                <strong>{d}/{m.total}</strong>
                {complete ? (
                  <em>已完成</em>
                ) : vipLocked ? (
                  <Link href="/account">{lockedNote(m)}</Link>
                ) : routeLocked ? (
                  <span className="pb-note">先完成上一级</span>
                ) : (
                  <Link href={m.page}>{d > 0 ? '继续' : '开始'}</Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="entry-grid" aria-label="更多入口">
        <Link href="/review"><b>复习站</b><span>错题回流</span></Link>
        <Link href="/notes"><b>知识笔记</b><span>速查要点</span></Link>
        <Link href="/parent"><b>家长中心</b><span>进度与报告</span></Link>
        <Link href="/papers"><b>模拟考</b><span>整套真题计时</span></Link>
      </section>
    </div>
  );
}
