import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import PapersBrowser from '@/components/PapersBrowser';

export const dynamic = 'force-static';

const OFFICIAL = [
  ['2026 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10284.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2026 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10269.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2025 年 12 月', 'https://gesp.ccf.org.cn/101/1010/10242.html', '含二级：环保能量球、黄金格'],
  ['2025 年 9 月', 'https://gesp.ccf.org.cn/101/1010/10229.html', '含二级：优美的数字、菱形'],
  ['2025 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10217.html', '含二级：数三角形'],
  ['2025 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10200.html', '含二级：等差矩阵、时间跨越'],
  ['2024 年 12 月', 'https://gesp.ccf.org.cn/101/1010/10178.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2024 年 9 月', 'https://gesp.ccf.org.cn/101/1010/10166.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2024 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10147.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2024 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10134.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2023 年 12 月', 'https://gesp.ccf.org.cn/101/1010/10119.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2023 年 9 月', 'https://gesp.ccf.org.cn/101/1010/10105.html', '含二级：数字黑洞'],
  ['2023 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10092.html', '含二级：自幂数'],
  ['2023 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10068.html', 'GESP 认证真题 ｜ CCF 官方'],
  ['2023 年合集', 'https://gesp.ccf.org.cn/101/1010/10100.html', '三月、六月、九月、十二月真题解析']
];

const BUILTIN = [
  ['📐 等差矩阵', ['2025.03 二级', '嵌套循环'], '输入 n m，输出 i×j 矩阵。样例：3 4 → 1 2 3 4 / 2 4 6 8 / 3 6 9 12'],
  ['⏰ 时间跨越', ['2025.03 二级', '闰年/分支'], '输入 y m d h k，求 k 小时后的时间。样例：2008 2 28 23 1 → 2008 2 29 0'],
  ['📏 数三角形', ['2025.06 二级', '枚举'], '计数直角边 a、b ≤ n 且面积为整数的三角形。样例：3 → 3；5 → 9'],
  ['✨ 优美的数字', ['2025.09 二级', '数位'], '数位全部相同的正整数个数。样例：100 → 18'],
  ['💎 画菱形', ['2025.09 二级', '图形/循环'], '用 # 画菱形边框。样例：n=5 输出 ..#.. / .#.#. / #...# / .#.#. / ..#..'],
  ['♻️ 环保能量球', ['2025.12 二级', '整除/枚举'], '输出 n + n/x。样例：3 组 (5,2)(10,3)(2,5) → 7 13 2'],
  ['🌟 黄金格', ['2025.12 二级', '数学函数'], '计数满足 √(r²+c²) ≤ x+r−c 的格子。样例：4 4 2 → 4'],
  ['🕳️ 数字黑洞', ['2023.09 二级', '数位/循环'], '三位数重排相减直到 495 的步数。样例：123 → 5'],
  ['🌺 自幂数', ['2023.06 二级', '数位/循环'], '判断是否等于各位数字的 n 次方之和。样例：153/12/370/1634 → T F T T']
];

const INDEX = [
  ['数位处理（n%10、n/10）', '数字黑洞、自幂数、优美的数字', '/course/2', '二级 课程'],
  ['嵌套循环 / 图形输出', '等差矩阵、画菱形', '/course/2', '二级 课程'],
  ['枚举 / 穷举', '环保能量球、数三角形', '/course/2', '二级 课程'],
  ['数学函数 / 判断', '黄金格', '/course/2', '二级 课程'],
  ['闰年 / 分支判断', '时间跨越', '/course/1', '一级 课程']
];

export default async function PapersPage() {
  let batches = [];
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'papers', 'index.json'), 'utf8');
    batches = JSON.parse(raw);
  } catch (e) {
    /* 题库数据缺失时仅展示原有内容 */
  }
  return (
    <>
      {batches.length > 0 && (
        <div className="panel">
          <h2>🖥️ 真题在线练习（2023.03 ~ 2026.06，共 {batches.length} 个批次）</h2>
          <p className="panel-sub">
            选择题点开即看答案；2023 年四个批次附官方解析，错题可对照“考纲知识点”回课程复习。
          </p>
          <PapersBrowser batches={batches} />
        </div>
      )}
      <div className="panel">
        <h2>🧾 官方真题汇总（2023.03 ~ 2026.06）</h2>
        <div className="paper-list">
          {OFFICIAL.map(([title, href, desc]) => (
            <a key={href} className="paper-card" href={href} target="_blank" rel="noopener">
              <b>{title}</b><span>{desc}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>🛠️ 内置真题示例（可直接运行）</h2>
        <div className="probs">
          {BUILTIN.map(([name, tags, desc]) => (
            <div className="prob" key={name}>
              <b>{name}</b><br />
              {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              <p>{desc}</p>
              <a href="/course/2">去课程练习 →</a>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>🧭 考点索引</h2>
        <table>
          <thead>
            <tr><th>考点</th><th>相关真题</th><th>对应课程</th></tr>
          </thead>
          <tbody>
            {INDEX.map(([point, papers, href, label]) => (
              <tr key={point}><td>{point}</td><td>{papers}</td><td><Link href={href}>{label}</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
