import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="course-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 32 }}>🧭</div>
      <h1>页面走丢了</h1>
      <p>这个地址不存在。回到学习中心继续吧～</p>
      <p>
        <Link href="/">🏠 回到首页</Link>
        {'　'}
        <Link href="/courses/">📚 课程地图</Link>
      </p>
    </section>
  );
}
