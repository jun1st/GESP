// 统一数据库接口：默认使用 SQLite（本地文件、Vercel 上用临时目录）。
// 只有显式设置 DATABASE_BACKEND=postgres 时才使用 Postgres（DATABASE_URL）。
// 注意：Vercel 上 SQLite 是临时存储（部署/冷启动/扩缩容后会重置），
// 适合当前演示期；需要正式持久化时，把环境变量 DATABASE_BACKEND 设为 postgres
// 并提供 DATABASE_URL 即可切换，无需改代码。
let impl = null;

// 探测一个可写目录放 SQLite 文件：本地沿用 web/.local.db；
// Vercel 等 process.cwd() 只读的环境自动回退到系统临时目录（os.tmpdir()）。
async function pickSqlitePath() {
  const path = await import('node:path');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const candidates = [
    { dir: process.cwd(), name: '.local.db' },
    { dir: os.tmpdir(), name: 'gesp-local.db' }
  ];
  for (const { dir, name } of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      const probe = path.join(dir, '.gesp-write-test');
      fs.writeFileSync(probe, '');
      fs.unlinkSync(probe);
      return path.join(dir, name);
    } catch {
      // 目录不可写，尝试下一个候选
    }
  }
  return path.join(process.cwd(), '.local.db');
}

async function init() {
  if (impl) return impl;

  if (process.env.DATABASE_BACKEND === 'postgres' && process.env.DATABASE_URL) {
    const { sql } = await import('@vercel/postgres');
    impl = {
      async query(text, params = []) {
        const r = await sql.query(text, params);
        return r.rows;
      },
      async run(text, params = []) {
        await sql.query(text, params);
      }
    };
    await impl.run(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        membership_expires_at TEXT,
        created_at TEXT NOT NULL
      )
    `);
    await impl.run(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, key)
      )
    `);
  } else {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(await pickSqlitePath());
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA busy_timeout = 5000;');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        membership_expires_at TEXT,
        created_at TEXT NOT NULL
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, key)
      )
    `);
    impl = {
      query(text, params = []) {
        // 把 $1/$2 占位符转成 SQLite 的 ?，保证与 Postgres 语法一致
        const sql = text.replace(/\$\d+/g, '?');
        return db.prepare(sql).all(...params);
      },
      run(text, params = []) {
        const sql = text.replace(/\$\d+/g, '?');
        db.prepare(sql).run(...params);
      }
    };
  }
  return impl;
}

export async function query(text, params) {
  return (await init()).query(text, params);
}

export async function run(text, params) {
  return (await init()).run(text, params);
}
