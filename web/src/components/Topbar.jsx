'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: '学习中心', key: '/' },
  { href: '/courses', label: '课程', key: '/courses' },
  { href: '/review', label: '复习站', key: '/review' },
  { href: '/parent', label: '家长中心', key: '/parent' },
  { href: '/syllabus', label: '官方考纲', key: '/syllabus' },
  { href: '/notes', label: '知识笔记', key: '/notes' },
  { href: '/papers', label: '真题资料库', key: '/papers' }
];

export default function Topbar() {
  const pathname = usePathname() || '/';
  const active = pathname === '/' ? '/' : '/' + pathname.split('/')[1];
  const [me, setMe] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/account/me', { cache: 'no-store' });
        const data = await res.json();
        setMe(data.user || null);
      } catch {
        setMe(null);
      }
    };
    load();
    window.addEventListener('gesp-auth-changed', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('gesp-auth-changed', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  return (
    <header className="site-topbar">
      <Link href="/" className="brand-mark" aria-label="GESP 学习中心首页">
        <span className="brand-icon">C</span>
        <span>GESP 学习中心</span>
      </Link>
      <nav className="site-nav" aria-label="主导航">
        {NAV.map((item) => (
          <Link key={item.key} href={item.href} className={active === item.key ? 'active' : ''}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-user">
        {me ? (
          <Link href="/account" className="user-chip">
            <span>👤 {me.phone.slice(0, 3)}****{me.phone.slice(7)}</span>
            {me.isMember && <i className="user-vip">VIP</i>}
          </Link>
        ) : (
          <Link href="/account" className="user-chip">👤 登录</Link>
        )}
      </div>
    </header>
  );
}
