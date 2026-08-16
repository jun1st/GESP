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
      ℹ️ 当前使用 SQLite 存储（演示期默认方案）。账号和进度数据保存在临时目录，
      部署或重启后可能清空；需要正式使用时，在 Vercel 项目设置中配置
      <code>DATABASE_BACKEND=postgres</code> 和 <code>DATABASE_URL</code> 即可切换到 Postgres。
    </div>
  );
}
