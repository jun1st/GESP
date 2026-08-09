import Link from 'next/link';

export default function LockedPanel({ title = '会员专享内容' }) {
  return (
    <div className="lock-panel">
      <div className="lock-emoji">🔒</div>
      <h2>{title}</h2>
      <p>
        开通付费会员后，一年内可以解锁全部课程、互动实验、历年真题与解析、错题复习和家长中心。
      </p>
      <ul>
        <li>✅ 1~8 级全部课程 + 互动实验 + 在线编译器</li>
        <li>✅ 14 个批次历年真题 + 官方解析</li>
        <li>✅ 错题本、复习站、家长学习报告</li>
      </ul>
      <div className="lock-actions">
        <Link href="/account">👤 登录 / 查看会员</Link>
        <span className="lock-hint">会员开通方式：联系管理员人工开通</span>
      </div>
    </div>
  );
}
