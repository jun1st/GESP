import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>GESP C++ 学习中心</span>
      <span>
        <Link href="/review">复习站</Link>
        <Link href="/parent">家长中心</Link>
        <Link href="/syllabus">官方考纲</Link>
        <Link href="/papers">真题资料库</Link>
      </span>
    </footer>
  );
}
