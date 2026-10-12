'use client';

import { useState } from 'react';
import DbWarning from '@/components/DbWarning';
import { TIERS, TIER_IDS } from '@/lib/plans';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState(TIER_IDS[0]);
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
      body: JSON.stringify({ token, phone, tier })
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: 'err', text: data.error || '操作失败' });
      return;
    }
    const expires = new Date(data.expiresAt);
    setMsg({ type: 'ok', text: `✅ 已开通：${phone} ${data.label} 有效期至 ${expires.toLocaleDateString('zh-CN')}` });
    setPhone('');
    if (overview) loadOverview();
  };

  return (
    <div className="panel ac-panel">
      <DbWarning />
      <h2>🔐 管理员：人工开通会员</h2>
      <p className="ac-hint">此页面仅限管理员使用。输入管理员密码，按 GESP 级别分档为已注册手机号开通：1-3 级、4-5 级、6-7 级、8 级各自独立开通，每次开通一个季度（90 天），重复开通则顺延。</p>
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
          <span>开通档位（每次一个季度）</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            {TIER_IDS.map((id) => <option key={id} value={id}>{TIERS[id].label}</option>)}
          </select>
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
              <tr><th>手机号</th><th>状态</th><th>各档位到期日</th></tr>
            </thead>
            <tbody>
              {overview.members.map((m) => (
                <tr key={m.phone}>
                  <td>{m.phone}</td>
                  <td>{m.active ? '✅ 会员' : '非会员'}</td>
                  <td>
                    {m.tiers.filter((t) => t.expiresAt).map((t) => (
                      <div key={t.tier}>
                        {t.label}：{new Date(t.expiresAt).toLocaleDateString('zh-CN')}
                        {t.active ? (t.daysLeft <= 15 ? `（⚠️ 剩 ${t.daysLeft} 天）` : `（剩 ${t.daysLeft} 天）`) : '（已到期）'}
                      </div>
                    ))}
                    {!m.tiers.some((t) => t.expiresAt) && '-'}
                  </td>
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
