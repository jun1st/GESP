// 统一数据库接口：生产用 Vercel Postgres（DATABASE_URL），本地开发回退到 SQLite 文件。
let impl = null;

async function init() {
  if (impl) return impl;

  if (process.env.DATABASE_URL) {
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
  } else {
    const { DatabaseSync } = await import('node:sqlite');
    const path = await import('node:path');
    const db = new DatabaseSync(path.join(process.cwd(), '.local.db'));
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        membership_expires_at TEXT,
        created_at TEXT NOT NULL
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
