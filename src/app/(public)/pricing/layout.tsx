import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'แพ็กเกจราคา — เลือกแผนที่เหมาะกับคุณ',
    description: 'เลือกแพ็กเกจเตรียมสอบทนายความที่เหมาะกับคุณ ตั้งแต่ฟรี ถึง Premium และ Pro พร้อมข้อสอบไม่จำกัดและ AI ตรวจอัตนัย',
    alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
