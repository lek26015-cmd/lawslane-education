import { PageHeader } from '@/components/education/page-header';
import { LawFacultyDirectory } from '@/components/education/law-faculty-directory';
import { LAW_FACULTIES, MYTCAS_COURSE_URL, MYTCAS_URL, TCAS70_ROUND3, TCAS70_SNAPSHOT } from '@/lib/law-faculties';
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
            <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h2 className="font-bold text-[#0B3979] mb-1">TCAS70 — สำหรับเข้าเรียนปีการศึกษา 2570</h2>
                <p className="text-sm text-slate-600 mb-3">กำหนดการรอบ 3 Admission (รอบที่คนส่วนใหญ่ยื่นคะแนนสอบกลาง)</p>
                <dl className="grid sm:grid-cols-3 gap-3 text-sm">
                    {TCAS70_ROUND3.map((r) => (
                        <div key={r.label} className="bg-white rounded-xl p-3 border border-blue-100">
                            <dt className="text-xs text-slate-500">{r.label}</dt>
                            <dd className="font-medium text-slate-900">{r.value}</dd>
                        </div>
                    ))}
                </dl>
                <p className="text-xs text-slate-500 mt-3">
                    ข้อมูลทางการ ณ {TCAS70_SNAPSHOT.asOf}: {TCAS70_SNAPSHOT.universitiesWithLaw} สถาบันขึ้นหลักสูตรนิติศาสตร์ปี 70 แล้ว
                    และประกาศเกณฑ์รอบ 3 แล้ว {TCAS70_SNAPSHOT.universitiesRound3Announced} สถาบัน (ส่วนใหญ่ใช้ GPAX) มหาวิทยาลัยรัฐขนาดใหญ่ส่วนมากยังไม่ประกาศ
                    ดูรายละเอียดและกำหนดการรอบอื่นอย่างเป็นทางการที่{' '}
                    <a href={MYTCAS_URL} target="_blank" rel="noopener noreferrer" className="underline text-[#0B3979]">mytcas.com</a>
                    {' '}และ{' '}
                    <a href={MYTCAS_COURSE_URL} target="_blank" rel="noopener noreferrer" className="underline text-[#0B3979]">ระบบข้อมูลหลักสูตร</a>
                </p>
            </section>
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
                รายชื่อและสถานะอ้างอิงข้อมูลหลักสูตรของ{' '}
                <a href={MYTCAS_COURSE_URL} target="_blank" rel="noopener noreferrer" className="underline text-[#0B3979]">mytcas.com (ทปอ.)</a>{' '}
                ณ {TCAS70_SNAPSHOT.asOf} สถาบันที่ติดป้าย "ยังไม่พบข้อมูลปี 70" อาจยังไม่ส่งข้อมูล ไม่ได้แปลว่าไม่เปิดสอน
                ส่วนวิชาที่แสดงเป็นของรอบ 3 ปี TCAS68 (ปีก่อนหน้า) จากเว็บอิสระที่ตรวจตรงกันหลายแหล่ง ไม่ใช่ข้อมูลทางการ ใช้ดูแนวทางเท่านั้น
                เกณฑ์ สัดส่วนคะแนน และจำนวนรับเปลี่ยนทุกปี โปรดตรวจประกาศปีล่าสุดของแต่ละมหาวิทยาลัยก่อนสมัคร
            </p>
        </div>
    );
}
