import { NextResponse } from 'next/server';

// 供前端展示部署环境状态（数据库模式等），帮助排查 Vercel 问题
export async function GET() {
  return NextResponse.json({
    dbMode:
      process.env.DATABASE_BACKEND === 'postgres' && process.env.DATABASE_URL
        ? 'postgres'
        : 'sqlite'
  });
}
