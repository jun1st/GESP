'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DbWarning from '@/components/DbWarning';

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <label className="ac-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}

export default function AccountPage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('login'); // login | register
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState(null);

  const loadMe = async () => {
    try {
      const res = await fetch('/api/account/me', { cache: 'no-store' });
      const data = await res.json();
      setMe(data.user || null);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const submitAuth = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setMsg({ type: 'err', text: '请输入正确的 11 位手机号' });
      return;
    }
    if (mode === 'register' && password !== confirm) {
      setMsg({ type: 'err', text: '两次输入的密码不一致' });
      return;
    }
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: 'err', text: data.error || '操作失败' });
      return;
    }
    setMsg({ type: 'ok', text: mode === 'login' ? '登录成功！' : '注册成功！' });
    setPassword('');
    setConfirm('');
    await loadMe();
    window.dispatchEvent(new CustomEvent('gesp-auth-changed'));
  };

  const changePwd = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    setPwdMsg({ type: res.ok ? 'ok' : 'err', text: data.error || '密码已修改' });
    if (res.ok) {
      setOldPassword('');
      setNewPassword('');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    window.dispatchEvent(new CustomEvent('gesp-auth-changed'));
  };

  if (loading) return <div className="panel"><p className="pb-loading">加载中…</p></div>;

  if (me) {
    const expires = me.membershipExpiresAt ? new Date(me.membershipExpiresAt) : null;
    const daysLeft = expires ? Math.max(0, Math.ceil((expires - new Date()) / 86400000)) : 0;
  return (
    <div className="panel ac-panel">
      <DbWarning />
      <h2>👤 我的账号</h2>
        <div className="ac-account">
          <p><b>手机号：</b>{me.phone}</p>
          <p><b>会员状态：</b>
            {me.isMember ? (
              <span className="vip-badge">👑 VIP 会员</span>
            ) : (
              <span className="free-badge">未开通会员</span>
            )}
          </p>
          {me.isMember && expires && (
            <p><b>有效期至：</b>{expires.toLocaleDateString('zh-CN')}（还剩 {daysLeft} 天）</p>
          )}
          {!me.isMember && (
            <p className="ac-hint">开通会员可解锁 1~8 级全部课程、真题与解析，有效期一年。请联系管理员人工开通。</p>
          )}
        </div>

        <form className="ac-form" onSubmit={changePwd}>
          <h3>🔑 修改密码</h3>
          <Field label="原密码" type="password" value={oldPassword} onChange={setOldPassword} placeholder="输入原密码" autoComplete="current-password" />
          <Field label="新密码" type="password" value={newPassword} onChange={setNewPassword} placeholder="6~32 位" autoComplete="new-password" />
          {pwdMsg && <p className={pwdMsg.type === 'ok' ? 'ac-ok' : 'ac-err'}>{pwdMsg.text}</p>}
          <button type="submit" className="ac-btn">修改密码</button>
        </form>

        <div className="ac-actions">
          <button type="button" className="ac-btn ghost" onClick={logout}>退出登录</button>
          <Link href="/courses" className="ac-btn ghost">📚 去上课</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel ac-panel">
      <DbWarning />
      <h2>{mode === 'login' ? '👤 登录' : '📝 注册'}</h2>
      <p className="ac-hint">使用手机号 + 密码登录。注册后联系管理员开通会员，一年内解锁全部内容。</p>
      <div className="ac-tabs">
        <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setMsg(null); }}>登录</button>
        <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setMsg(null); }}>注册</button>
      </div>
      <form className="ac-form" onSubmit={submitAuth}>
        <Field label="手机号" type="tel" value={phone} onChange={setPhone} placeholder="11 位手机号" autoComplete="username" />
        <Field label="密码" type="password" value={password} onChange={setPassword} placeholder={mode === 'register' ? '设置密码（6~32 位）' : '输入密码'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
        {mode === 'register' && (
          <Field label="确认密码" type="password" value={confirm} onChange={setConfirm} placeholder="再次输入密码" autoComplete="new-password" />
        )}
        {msg && <p className={msg.type === 'ok' ? 'ac-ok' : 'ac-err'}>{msg.text}</p>}
        <button type="submit" className="ac-btn">{mode === 'login' ? '登 录' : '注 册'}</button>
      </form>
    </div>
  );
}
