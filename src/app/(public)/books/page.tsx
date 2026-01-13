import { AnimatedBookGrid } from "@/components/education/animated-book-grid";
import { PageHeader } from "@/components/education/page-header";
import { getBooks } from "@/lib/mock-store";

export default async function BookListingPage() {
    // Use mock store directly for Server Component
    const books = getBooks();

    return (
        <div className="space-y-6">
            <PageHeader
                title="ร้านหนังสือแนะนำ"
                description="คัดสรรหนังสือคุณภาพเพื่อนักกฎหมายโดยเฉพาะ ทั้งคู่มือสอบ สรุปย่อ และรวมข้อสอบเก่า"
                icon="BookOpen"
                theme="purple"
                backLink="/"
                backLabel="กลับหน้าหลัก"
                badge={`${books.length} เล่ม`}
            />

            <AnimatedBookGrid books={books} />
        </div>
    );
}
