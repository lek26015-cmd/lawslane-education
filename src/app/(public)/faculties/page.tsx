import { PageHeader } from '@/components/education/page-header';
import { LawFacultyDirectory } from '@/components/education/law-faculty-directory';
import { LAW_FACULTIES, TCAS_LAW_URL } from '@/lib/law-faculties';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'เตรียมสอบเข้านิติศาสตร์ TCAS — คณะนิติศาสตร์ทั้งหมดในไทย',
    description: `คู่มือเตรียมสอบเข้านิติศาสตร์ผ่าน TCAS: รอบการรับสมัคร วิชาที่ต้องเตรียม และรายชื่อ ${LAW_FACULTIES.length} สถาบันที่เปิดสอน`,
    alternates: { canonical: '/faculties' },
};

export default function FacultiesPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            <PageHeader
                title="เตรียมสอบเข้านิติศาสตร์"
                description="TCAS รอบการรับสมัคร วิชาที่ต้องเตรียม และคณะนิติศาสตร์ทุกแห่งในไทย"
                icon="GraduationCap"
                theme="sky"
                backLink="/"
                backLabel="กลับหน้าหลัก"
            />
            <section className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <h2 className="font-bold text-slate-900 mb-3">TCAS มี 4 รอบ</h2>
                    <ol className="space-y-2 text-sm text-slate-700 list-decimal pl-5">
                        <li><b>Portfolio</b> — ส่งแฟ้มสะสมผลงาน</li>
                        <li><b>โควตา</b> — ตามพื้นที่/โรงเรียน/คุณสมบัติเฉพาะ</li>
                        <li><b>Admission</b> — ใช้คะแนนสอบกลาง (รอบที่คนส่วนใหญ่ยื่น)</li>
                        <li><b>รับตรงอิสระ</b> — มหาวิทยาลัยคัดเลือกเอง</li>
                    </ol>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <h2 className="font-bold text-slate-900 mb-3">คะแนนที่คณะนิติศาสตร์มักใช้</h2>
                    <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                        <li><b>TGAT</b> — ความถนัดทั่วไป (ภาษาอังกฤษ, การคิดอย่างมีเหตุผล, สมรรถนะการทำงาน)</li>
                        <li><b>A-Level</b> — สังคมศึกษา, ภาษาไทย, ภาษาอังกฤษ และบางแห่งใช้คณิตศาสตร์</li>
                        <li><b>GPAX</b> — บางมหาวิทยาลัยใช้หรือกำหนดขั้นต่ำ</li>
                    </ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:col-span-2">
                    <h2 className="font-bold text-slate-900 mb-3">แนวทางเตรียมตัว</h2>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700 list-disc pl-5">
                        <li>ดูเกณฑ์ปีล่าสุดของคณะที่หมายตาก่อน แล้วเลือกวิชาที่ต้องเน้น</li>
                        <li>ฝึกอ่านจับใจความและเขียนภาษาไทย เพราะวิชากฎหมายต้องอ่านเยอะ</li>
                        <li>สังคมศึกษา: เน้นหน้าที่พลเมือง รัฐธรรมนูญ และกฎหมายเบื้องต้น</li>
                        <li>ภาษาอังกฤษ: ฝึกอ่านบทความยาวให้ทันเวลา</li>
                        <li>ฝึกข้อสอบ TGAT ส่วนการคิดอย่างมีเหตุผลให้คล่อง</li>
                        <li>เลือกคณะหลายลำดับให้ครอบคลุมทั้งเสี่ยงและปลอดภัย</li>
                    </ul>
                </div>
            </section>
            <h2 className="text-xl font-bold text-slate-900">รายชื่อคณะนิติศาสตร์ทั้งหมด</h2>
            <LawFacultyDirectory />
            <p className="text-xs text-slate-500">
                รายชื่อจากระบบ TCAS ทั้งหมด {LAW_FACULTIES.length} แห่ง วิชาที่แสดงเป็นข้อมูลรอบ 3 ปี TCAS68 เฉพาะมหาวิทยาลัยที่ตรวจข้อมูลได้ตรงกันหลายแหล่ง เกณฑ์ สัดส่วนคะแนน และจำนวนรับเปลี่ยนทุกปี
                โปรดตรวจรายละเอียดล่าสุดที่{' '}
                <a href={TCAS_LAW_URL} target="_blank" rel="noopener noreferrer" className="underline text-[#0B3979]">
                    tcas.in.th
                </a>{' '}
                หรือประกาศของแต่ละมหาวิทยาลัย
            </p>
        </div>
    );
}
