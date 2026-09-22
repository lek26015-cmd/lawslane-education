import { AnimatedBookGrid } from "@/components/education/animated-book-grid";
import { BookstoreHero } from "@/components/education/bookstore-hero";
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
            <BookstoreHero bookCount={books.length} />

            {/* Ad Banner */}
            <GoogleAd variant="banner" />

            <AnimatedBookGrid books={books} />
        </div>
    );
}
