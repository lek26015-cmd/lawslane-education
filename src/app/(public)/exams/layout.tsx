import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'คลังข้อสอบกฎหมาย — ข้อสอบทนายความ เนติบัณฑิต ทุกชั้นปี',
    description: 'แหล่งรวมข้อสอบกฎหมายย้อนหลังกว่า 2,000 ชุด ครบทุกชั้นปี ตั๋วทนาย เนติบัณฑิต พร้อม AI ตรวจอัตนัย ฝึกทำซ้ำได้ไม่จำกัด — Lawslane Wittaya',
    keywords: [
        'ข้อสอบกฎหมาย', 'ข้อสอบทนาย', 'ข้อสอบเนติ', 'สอบตั๋วทนาย',
        'ข้อสอบกฎหมายแพ่ง', 'ข้อสอบกฎหมายอาญา', 'ข้อสอบวิธีพิจารณาความ',
        'ข้อสอบเก่า', 'ฝึกทำข้อสอบ', 'เฉลยข้อสอบกฎหมาย',
    ],
    alternates: { canonical: '/exams' },
    openGraph: {
        title: 'คลังข้อสอบกฎหมาย — กว่า 2,000 ชุด ครบทุกชั้นปี',
        description: 'ฝึกทำข้อสอบกฎหมายจริง พร้อม AI ตรวจอัตนัย — Lawslane Wittaya',
    },
};

export default function ExamsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
