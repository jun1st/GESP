import { NextResponse } from 'next/server';
import { getMemberContext } from '@/lib/member';
import { buildReport } from '@/lib/report';

export async function GET() {
  const { user, isMember } = await getMemberContext();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  if (!isMember) return NextResponse.json({ error: '会员专享' }, { status: 403 });
  return NextResponse.json(await buildReport(user.id));
}
