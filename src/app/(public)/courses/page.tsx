import ComingSoonOverlay from '@/components/coming-soon-overlay';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'คอร์สเรียนกฎหมาย — เรียนออนไลน์ เตรียมสอบทนาย',
    description: 'คอร์สเรียนกฎหมายออนไลน์ เตรียมสอบทนายความ สอบเนติบัณฑิต สอนโดยอาจารย์ผู้เชี่ยวชาญ จาก Lawslane Wittaya',
    alternates: { canonical: '/courses' },
};

export default function CoursesPage() {
  return <ComingSoonOverlay title="คอร์สเรียนกฎหมาย" />;
}
