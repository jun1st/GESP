import { notFound } from 'next/navigation';
import { readLevel, readRelated, LEVEL_CN } from '@/lib/courseData';
import { getMemberContext } from '@/lib/member';
import CourseView from '@/components/CourseView';

const LEVEL_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

export const dynamicParams = false;

export async function generateStaticParams() {
  return LEVEL_IDS.map((id) => ({ level: String(id) }));
}

export default async function CoursePage({ params }) {
  const { level } = await params;
  if (!LEVEL_IDS.includes(Number(level)) || String(Number(level)) !== level) notFound();
  const data = await readLevel(level);
  const { isMember } = await getMemberContext();
  const related = await readRelated(`level-${data.id}`);
  const levelName = LEVEL_CN[data.id];

  return <CourseView data={data} related={related} levelName={levelName} locked={!isMember} />;
}
