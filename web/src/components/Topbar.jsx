'use client';

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
    </header>
  );
}
