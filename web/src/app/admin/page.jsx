'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [months, setMonths] = useState(12);
  const [msg, setMsg] = useState(null);

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
  };

  return (
    <div className="panel ac-panel">
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
    </div>
  );
}
