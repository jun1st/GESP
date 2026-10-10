import { readFundamentals, readRelated } from '@/lib/courseData';
import CourseView from '@/components/CourseView';

export default async function FundamentalsPage() {
  const data = await readFundamentals();
  const related = await readRelated('fundamentals');
  return <CourseView data={data} related={related} levelName="基础常识" locked={false} />;
}
