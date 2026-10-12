import { NextResponse } from 'next/server';
import { getMemberContext } from '@/lib/member';
import { loadPaper, loadSample } from '@/lib/papers';

// 查阅试卷：会员返回整卷；非会员（?sample=1）只返回该 Level 的样例题
export async function GET(request) {
  const url = new URL(request.url);
  const session = url.searchParams.get('session');
  const level = url.searchParams.get('level');
  const wantSample = url.searchParams.get('sample') === '1';
  const { hasLevel } = await getMemberContext();

  if (wantSample || !hasLevel(level)) {
    const sample = await loadSample(level);
    return sample ? NextResponse.json(sample) : NextResponse.json({ error: '暂无样例' }, { status: 404 });
  }
  const paper = await loadPaper(session, level);
  return paper ? NextResponse.json(paper) : NextResponse.json({ error: '试卷不存在' }, { status: 404 });
}
