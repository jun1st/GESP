// 从旧静态站 level3-8.html 抽取完整课程内容（讲解 / 代码块 / 每课小测），
// 生成 Next 版课程数据 web/data/levels/level-{3..8}.json。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'web', 'data', 'levels');
mkdirSync(outDir, { recursive: true });

const LEVELS = [
  { lv: 3, cn: '三级', emoji: '🧭', title: 'GESP C++ 三级课程', description: '数据编码、进制转换、位运算、一维数组、字符串函数、枚举与模拟。' },
  { lv: 4, cn: '四级', emoji: '🏗️', title: 'GESP C++ 四级课程', description: '指针、二维数组、结构体、函数、参数传递、递推、排序、文件与异常。' },
  { lv: 5, cn: '五级', emoji: '🧠', title: 'GESP C++ 五级课程', description: '初等数论、高精度、链表、欧几里得与筛法、二分、递归、贪心、分治。' },
  { lv: 6, cn: '六级', emoji: '🌳', title: 'GESP C++ 六级课程', description: '树、特殊二叉树、DFS/BFS、简单动态规划、面向对象与栈队列。' },
  { lv: 7, cn: '七级', emoji: '🕸️', title: 'GESP C++ 七级课程', description: '数学库函数、复杂动态规划、图的遍历、图论算法、哈希表。' },
  { lv: 8, cn: '八级', emoji: '🏁', title: 'GESP C++ 八级课程', description: '计数原理、排列组合、杨辉三角、倍增法、代数几何、图论综合、复杂度、优化。' }
];

function decode(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(s) {
  return decode(s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function firstMatch(re, html, i = 1) {
  const m = html.match(re);
  return m ? decode(m[i]).trim() : '';
}

function allMatches(re, html) {
  return [...html.matchAll(re)].map((m) => decode(m[1]).trim()).filter(Boolean);
}

function slugify(s) {
  const map = { '&': 'and', ' ': '-' };
  return s
    .toLowerCase()
    .replace(/[（(].*?[)）]/g, '')
    .replace(/[&]/g, ' and ')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

for (const { lv, cn, emoji, title, description } of LEVELS) {
  const html = readFileSync(join(root, `level${lv}.html`), 'utf8');

  // 每课小测数据：const LQ = { ... };
  const lqRaw = html.match(/const LQ = ([\s\S]*?);\nfunction/);
  if (!lqRaw) throw new Error(`level${lv}.html 找不到 LQ`);
  // eslint-disable-next-line no-eval
  const LQ = eval(`(${lqRaw[1]})`);
  for (const key of Object.keys(LQ)) {
    LQ[key] = LQ[key].map((q) => ({
      q: decode(q.q),
      options: q.o.map(decode),
      answer: q.a,
      explain: decode(q.e)
    }));
  }

  const lessons = [];
  const blockRe = /<details class="lesson" id="lv\d+l\d+"[^>]*>([\s\S]*?)<\/details>/g;
  let m;
  let n = 0;
  while ((m = blockRe.exec(html)) !== null) {
    const block = m[1];
    n += 1;
    const lgoal = firstMatch(/<span class="lgoal">([\s\S]*?)<\/span>/, block);
    const goal = firstMatch(/<div class="goal">([\s\S]*?)<\/div>/, block);
    // 按文档顺序收集讲解段落与列表项（goal/callout/codebox 都是 div，自然被跳过）
    const blocks = [];
    const contentRe = /<p>([\s\S]*?)<\/p>|<li>([\s\S]*?)<\/li>/g;
    let cm;
    while ((cm = contentRe.exec(block)) !== null) {
      const t = stripTags(cm[1] || cm[2] || '');
      if (t) blocks.push(t);
    }
    const code = allMatches(/<div class="codebox"><pre>([\s\S]*?)<\/pre>/g, block);
    const summary =
      (firstMatch(/<div class="callout info">([\s\S]*?)<\/div>/, block) || blocks[0] || lgoal)
        .replace(/^📌\s*本节小结[:：]\s*/, '');

    const titlePart = lgoal.split('：')[0];
    lessons.push({
      id: slugify(lgoal) || `lesson-${n}`,
      anchor: `lv${lv}l${n}`,
      title: `第 ${n} 课：${lgoal}`,
      summary: summary.length > 60 ? summary.slice(0, 60) + '…' : summary,
      goal,
      tags: titlePart ? [titlePart] : [],
      blocks,
      code,
      quiz: LQ[`l${n}`] || [],
      practice: { title: '考一考', prompt: LQ[`l${n}`]?.[0]?.q || '完成本课小测，错题会自动进入复习站。' }
    });
  }

  const data = {
    id: lv,
    slug: `level-${lv}`,
    title,
    description,
    emoji,
    progressKey: `gesp_lv${lv}_prog`,
    sourcePage: `level${lv}.html`,
    lessons,
    practiceLinks: []
  };

  writeFileSync(join(outDir, `level-${lv}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`level-${lv}: ${n} 课，小测 ${Object.keys(LQ).length} 组`);
}
