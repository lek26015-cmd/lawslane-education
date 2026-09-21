import { AnimatedBookGrid } from "@/components/education/animated-book-grid";
import { PageHeader } from "@/components/education/page-header";
import { getAllBooks } from "@/lib/education-data-admin";
import { GoogleAd } from '@/components/google-ad';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
    title: 'หนังสือเตรียมสอบทนาย — คู่มือสอบ สรุปย่อ รวมข้อสอบเก่า',
    description: 'หนังสือเตรียมสอบใบอนุญาตว่าความ คู่มือสอบเนติบัณฑิต สรุปย่อกฎหมาย และรวมข้อสอบเก่าพร้อมเฉลย คัดสรรจาก Lawslane Wittaya',
    alternates: { canonical: '/books' },
};

export default async function BookListingPage() {
    const books = await getAllBooks();

    return (
        <div className="space-y-6">
            <PageHeader
                title="ร้านหนังสือแนะนำ"
                description="คัดสรรหนังสือคุณภาพเพื่อนักกฎหมายโดยเฉพาะ ทั้งคู่มือสอบ สรุปย่อ และรวมข้อสอบเก่า"
                icon="BookOpen"
                theme="sky"
                backLink="/"
                backLabel="กลับหน้าหลัก"
                badge={`${books.length} เล่ม`}
            />

            {/* Ad Banner */}
            <GoogleAd variant="banner" />

            <AnimatedBookGrid books={books} />
        </div>
    );
}
