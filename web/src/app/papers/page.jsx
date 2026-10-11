import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import PapersBrowser from '@/components/PapersBrowser';
import { getMemberContext } from '@/lib/member';

/** CCF 官网考季汇总页（PDF 下载入口） */
const OFFICIAL_SESSIONS = [
  ['2026 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10284.html'],
  ['2026 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10269.html'],
  ['2025 年 12 月', 'https://gesp.ccf.org.cn/101/1010/10242.html'],
  ['2025 年 9 月', 'https://gesp.ccf.org.cn/101/1010/10229.html'],
  ['2025 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10217.html'],
  ['2025 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10200.html'],
  ['2024 年 12 月', 'https://gesp.ccf.org.cn/101/1010/10178.html'],
  ['2024 年 9 月', 'https://gesp.ccf.org.cn/101/1010/10166.html'],
  ['2024 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10147.html'],
  ['2024 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10134.html'],
  ['2023 年 12 月', 'https://gesp.ccf.org.cn/101/1010/10119.html'],
  ['2023 年 9 月', 'https://gesp.ccf.org.cn/101/1010/10105.html'],
  ['2023 年 6 月', 'https://gesp.ccf.org.cn/101/1010/10092.html'],
  ['2023 年 3 月', 'https://gesp.ccf.org.cn/101/1010/10068.html']
];

async function loadSessions() {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'public', 'data', 'papers', 'index.json'),
      'utf8'
    );
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function PapersPage() {
  const { isMember } = await getMemberContext();
  const sessions = await loadSessions();
  const sessionCount = sessions.length;
  const paperCount = sessions.reduce((n, s) => n + (s.levels?.length || 0), 0);

  return (
    <div className="papers-page">
      <header className="papers-hero panel">
        <h1>真题资料库</h1>
        <p className="panel-sub">
          官方 GESP C++ 历年试卷：按考季与 Level 归档，支持<strong>原卷模拟考</strong>与<strong>查阅解析</strong>。
          {sessionCount > 0 && (
            <> 当前收录 <b>{sessionCount}</b> 个考季、<b>{paperCount}</b> 份试卷（2023.03 ~ 2026.06）。</>
          )}
        </p>
        <ul className="papers-hero-list">
          <li>模拟考：限时作答，交卷后自动评分（单选、判断；编程题供自评）。</li>
          <li>查阅：逐题展开答案；2023 年四个考季附官方文字解析。</li>
          <li>课程中的「相关真题」从本库按知识点匹配，可在各级课程里复习。</li>
        </ul>
        {!isMember && sessionCount > 0 && (
          <p className="papers-guest-hint">
            完整题库与模拟考为 <Link href="/account">会员</Link> 专享；非会员每个 Level 可免费查看 5 道样例题，也可前往 CCF 官网下载 PDF。
          </p>
        )}
      </header>

      {sessionCount > 0 && isMember && (
        <div className="panel papers-main">
          <h2 className="papers-section-title">选考季与 Level</h2>
          <PapersBrowser sessions={sessions} />
        </div>
      )}

      {sessionCount > 0 && !isMember && (
        <div className="panel papers-main">
          <h2 className="papers-section-title">免费样例：每个 Level 5 道题</h2>
          <PapersBrowser sessions={sessions} sample />
          <p className="callout info papers-member-cta">
            开通 <Link href="/account">会员</Link> 后可使用全部 {paperCount} 份试卷、模拟考与完整解析。
          </p>
        </div>
      )}

      {sessionCount === 0 && (
        <div className="panel">
          <p className="pb-note">站内题库数据暂未就绪，请稍后再试或从 CCF 官网获取 PDF。</p>
        </div>
      )}

      <details className="panel papers-official">
        <summary>CCF 官网 · 真题 PDF 下载</summary>
        <p className="panel-sub">以下链接跳转至中国计算机学会 GESP 官方页面，可下载原始 PDF。</p>
        <div className="paper-list">
          {OFFICIAL_SESSIONS.map(([title, href]) => (
            <a key={href} className="paper-card" href={href} target="_blank" rel="noopener noreferrer">
              <b>{title}</b>
              <span>打开官方页面 →</span>
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}
