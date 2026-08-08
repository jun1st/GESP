'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// 旧静态站 / Express 路由 → Next 新路由，保留老书签和外部链接。
const REDIRECTS = {
  'index.html': '/',
  'course.html': '/courses/',
  'courses.html': '/courses/',
  'fundamentals.html': '/course/0/',
  'level0.html': '/course/0/',
  'level1.html': '/course/1/',
  'level2.html': '/course/2/',
  'level3.html': '/course/3/',
  'level4.html': '/course/4/',
  'level5.html': '/course/5/',
  'level6.html': '/course/6/',
  'level7.html': '/course/7/',
  'level8.html': '/course/8/',
  'review.html': '/review/',
  'parent.html': '/parent/',
  'syllabus.html': '/syllabus/',
  'notes.html': '/notes/',
  'papers.html': '/papers/'
};

export default function NotFound() {
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/';
    let rel = window.location.pathname;
    if (rel.startsWith(base)) rel = rel.slice(base.length);
    else rel = rel.replace(/^\//, '');
    const key = rel.split('/')[0];
    const target = REDIRECTS[key];
    if (target) {
      window.location.replace(base + target);
      return;
    }
    if (/^levels\/[0-8]$/.test(rel) || /^course\/[0-8]$/.test(rel)) {
      window.location.replace(base + 'course/' + rel.split('/')[1] + '/');
    }
  }, []);

  return (
    <section className="course-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 56 }}>🧭</div>
      <h1>页面走丢了</h1>
      <p>这个地址不存在，可能是旧版的链接。回到学习中心继续吧～</p>
      <p>
        <Link href="/">🏠 回到首页</Link>
        {'　'}
        <Link href="/courses/">📚 课程地图</Link>
      </p>
    </section>
  );
}
