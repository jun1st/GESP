'use client';

import { useState } from 'react';
import DbWarning from '@/components/DbWarning';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [months, setMonths] = useState(12);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState(null);
  const [ovErr, setOvErr] = useState('');

  const loadOverview = async (e) => {
    e?.preventDefault();
    setOvErr('');
    const res = await fetch('/api/admin/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, search })
    });
    const data = await res.json();
    if (!res.ok) {
      setOvErr(data.error || '加载失败');
      return;
    }
    setOverview(data);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/admin/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, phone, months: Number(months) })
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: 'err', text: data.error || '操作失败' });
      return;
    }
    const expires = new Date(data.expiresAt);
    setMsg({ type: 'ok', text: `✅ 已开通：${phone} 会员有效期至 ${expires.toLocaleDateString('zh-CN')}` });
    setPhone('');
    if (overview) loadOverview();
  };

  return (
    <div className="panel ac-panel">
      <DbWarning />
      <h2>🔐 管理员：人工开通会员</h2>
      <p className="ac-hint">此页面仅限管理员使用。输入管理员密码，为已注册手机号开通/延长会员（按自然月累加，一年 = 12 个月）。</p>
      <form className="ac-form" onSubmit={submit}>
        <label className="ac-field">
          <span>管理员密码</span>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" autoComplete="off" />
        </label>
        <label className="ac-field">
          <span>用户手机号</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11 位手机号" />
        </label>
        <label className="ac-field">
          <span>开通月数</span>
          <input type="number" min="1" max="120" value={months} onChange={(e) => setMonths(e.target.value)} />
        </label>
        {msg && <p className={msg.type === 'ok' ? 'ac-ok' : 'ac-err'}>{msg.text}</p>}
        <button type="submit" className="ac-btn">开通会员</button>
      </form>

      <h2>👥 会员列表</h2>
      <form className="ac-form" onSubmit={loadOverview}>
        <label className="ac-field">
          <span>按手机号搜索（可留空查看全部）</span>
          <input type="tel" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="手机号的一部分" />
        </label>
        {ovErr && <p className="ac-err">{ovErr}</p>}
        <button type="submit" className="ac-btn">查询（需先填上面的管理员密码）</button>
      </form>
      {overview && (
        <>
          <table>
            <thead>
              <tr><th>手机号</th><th>状态</th><th>到期日</th><th>剩余</th></tr>
            </thead>
            <tbody>
              {overview.members.map((m) => (
                <tr key={m.phone}>
                  <td>{m.phone}</td>
                  <td>{m.active ? (m.daysLeft <= 30 ? '⚠️ 即将到期' : '✅ 会员') : '非会员'}</td>
                  <td>{m.expiresAt ? new Date(m.expiresAt).toLocaleDateString('zh-CN') : '-'}</td>
                  <td>{m.active ? `${m.daysLeft} 天` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>🧩 真题未覆盖统计</h2>
          <p className="ac-hint">未覆盖题 = 没有任何一课能对应的真题。数量多的 Level 说明课程缺内容；下面是各课已对应的题数。</p>
          {overview.uncovered.map((row) => (
            <details key={row.level}>
              <summary>
                {row.level} 级：共 {row.total} 题，未覆盖 {row.uncovered} 题（{Math.round((row.uncovered / row.total) * 100)}%）
              </summary>
              <ul>
                {row.lessons.map((l) => <li key={l.anchor}>{l.title}：{l.count} 题</li>)}
              </ul>
            </details>
          ))}
        </>
      )}
    </div>
  );
}
