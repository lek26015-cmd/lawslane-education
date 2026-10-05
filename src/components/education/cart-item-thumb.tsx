import { ExamBookCover } from '@/components/education/brand-cover';
import { isTemplateExamCover } from '@/lib/book-cover';

type Item = { title: string; type?: string; coverUrl?: string; originalItem?: { description?: string; category?: string; isDigital?: boolean } };

/** รูปปกในตะกร้า/เช็กเอาต์ — หนังสือรวมข้อสอบวาดปกด้วยโค้ดแบบเดียวกับหน้าอื่น (coverUrl ที่เก็บในตะกร้าเป็นภาพ template เดิม) */
export function isExamCartItem(item: Item): boolean {
    return isTemplateExamCover(item.coverUrl ?? '') || item.originalItem?.category === 'exam';
}

export function CartItemThumb({ item }: { item: Item }) {
    if (isExamCartItem(item)) {
        return <ExamBookCover title={item.title} description={item.originalItem?.description} compact />;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.coverUrl || ''} alt={item.title} className="h-full w-full object-cover" />;
}

/** สินค้าดิจิทัล (E-Book / คอร์ส) — ไม่มีการจัดส่ง ไม่ต้องกรอกที่อยู่ */
export function isDigitalCartItem(item: Item): boolean {
    return (
        isExamCartItem(item) ||
        item.type === 'COURSE' ||
        item.type === 'EXAM' ||
        !!item.originalItem?.isDigital ||
        /คอร์ส|Course|E-Book|e-book|ebook/i.test(item.title)
    );
}
