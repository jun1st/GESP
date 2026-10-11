import { buildSyllabus } from '@/lib/courseData';
import SyllabusView from '@/components/SyllabusView';

export const metadata = { title: '官方考纲 · GESP C++ 学习中心' };

export default async function SyllabusPage() {
  const levels = await buildSyllabus();
  return (
    <>
      <div className="panel">
        <h2>考试说明</h2>
        <div className="callout info">
          题型：单选题 15×2 分 + 判断题 10×2 分 + 编程题 2×25 分。考试时间：1-4 级 120 分钟，5-8 级 180 分钟。C++ 考题以 C++11 标准为准。
        </div>
      </div>
      <div className="panel">
        <h2>考纲 · 课程 · 真题</h2>
        <p className="panel-sub">每个考点对应本站的课程，点课名进入学习，课末有该课相关真题。课程与完整真题为会员专享。</p>
        <SyllabusView levels={levels} />
      </div>
    </>
  );
}
