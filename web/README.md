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
| `/course/0` ~ `/course/8` | 级别课程（数据驱动 + 打卡） |
| `/review` | 复习站（错题本） |
| `/parent` | 家长中心 |
| `/syllabus` | 官方考纲 |
| `/notes` | 知识笔记速记卡 |
| `/papers` | 真题资料库 |

## 开发

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # 静态导出到 out/
```

## 部署

静态导出产物在 `out/`，可部署到 GitHub Pages 或 Vercel（Vercel 直接部署本目录即可，无需 `output: 'export'`）。

## 迁移状态

- 已迁移：首页、课程地图、1-8 级课程、复习站、家长中心、官方考纲、知识笔记、真题资料库
- 已迁移互动实验（0-2 级课程页内）：二进制字节开关、进制转换、存储单位、电脑零件、变量盒子、算术、逻辑灯、分支滑块、数星星、断电实验、网络圈、流程图、ASCII 编码器、整数除法、switch 穿透、循环图形、数学函数、掷骰子、在线编译器
- 待迁移：3-8 级互动实验（迁移完成后可退役 `server.js` / `legacyPage` 与旧 HTML）
