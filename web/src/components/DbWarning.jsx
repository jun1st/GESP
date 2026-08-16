'use client';

import { useEffect, useState } from 'react';

export default function DbWarning() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/system/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMode(d.dbMode || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode !== 'sqlite') return null;
  return (
    <div className="db-warning">
      ⚠️ 当前站点未配置生产数据库（DATABASE_URL），数据保存在服务器临时目录，注册/进度等可能在扩容或重启后丢失。
      请在 Vercel 项目设置中添加 <code>DATABASE_URL</code>（Vercel Postgres 或 Neon）后重新部署。
    </div>
  );
}
