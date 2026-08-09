# GESP 学习中心 · Next.js 前端工程

用 Next.js（App Router）重构的前端工程，替代散落的 HTML 页面。

## 技术栈

- Next.js 16 + React 19（静态导出 `output: 'export'`，可部署 GitHub Pages / Vercel / 任意静态托管）
- 课程数据来自 `data/levels/*.json`（服务端读取，构建时生成静态页）
- 共享组件：`Topbar`（全站唯一导航栏）、`Footer`、布局统一在 `src/app/layout.jsx`
- 进度/错题/登录均使用浏览器 localStorage（与旧站共用同一批 key，进度互通）

## 页面

| 路由 | 说明 |
|---|---|
| `/` | 学习中心（落地页 + 登录驾驶舱） |
| `/courses` | 课程地图（数据驱动） |
| `/course/0` ~ `/course/8` | 级别课程（数据驱动 + 打卡；1-8 级为会员专享） |
| `/review` | 复习站（错题本，会员专享） |
| `/parent` | 家长中心（会员专享） |
| `/syllabus` | 官方考纲 |
| `/notes` | 知识笔记速记卡 |
| `/papers` | 真题资料库（在线练习为会员专享） |
| `/account` | 登录 / 注册 / 我的账号 / 修改密码 |
| `/admin` | 管理员：人工开通会员（需 ADMIN_TOKEN） |

## 开发

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
```

## 部署（Vercel）

在 Vercel 导入本仓库 `web` 目录，并配置环境变量：

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 连接串（Vercel Postgres / Neon 等）。未配置时本地开发自动使用 SQLite（`web/.local.db`） |
| `SESSION_SECRET` | 会话签名密钥（`openssl rand -hex 32` 生成） |
| `ADMIN_TOKEN` | 管理员密码，用于 `/admin` 页人工开通会员 |

首次启动自动建表 `users`（手机号、密码哈希、会员到期时间）。

## 会员体系

- 手机号 + 密码注册/登录，支持修改密码、退出登录
- 管理员在 `/admin` 输入 ADMIN_TOKEN，为已注册手机号开通/延长会员（按自然月累加）
- 会员有效期一年内（12 个月），解锁 1-8 级课程、互动实验、真题在线练习、复习站、家长中心
- 免费内容：首页、课程地图、官方考纲、知识笔记、0 级基础课程
- 内容门禁在服务端执行（动态渲染），非会员拿不到课程正文/题库数据

## 迁移状态

- 已迁移：首页、课程地图、1-8 级课程、复习站、家长中心、官方考纲、知识笔记、真题资料库
- 已迁移互动实验：
  - 0 级：二进制字节开关、进制转换、存储单位
  - 1 级：电脑零件、变量盒子、算术、逻辑灯、分支滑块、数星星、在线编译器
  - 2 级：断电实验、网络圈、流程图、ASCII 编码器、整数除法、switch 穿透、循环图形、数学函数、掷骰子、在线编译器
  - 3-8 级：每课完整讲解 + 代码一键复制 + 每课小测（错题自动进复习站）+ 在线编译器
- 已集成历年真题：
  - `web/scripts/extract_papers.py` 解析本地 `真题PDF/`（2023.03 ~ 2026.06 共 14 个批次）为题库 JSON（`web/public/data/papers/`）
  - 真题资料库页新增「真题在线练习」：按批次/级别筛选，点击看答案；2023 年四个批次附考纲知识点与解析
  - `web/scripts/build_related.py` 按考纲知识点+关键词把题目挂到课程各章，课程页每课可展开「本节相关真题」
- 旧站与 Express 路由（`server.js` / `legacyPage` / 根目录 HTML）已退役；线上部署迁移至 Vercel
