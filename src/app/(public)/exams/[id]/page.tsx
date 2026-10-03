import { Exam } from "@/lib/education-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, CheckCircle, AlertTriangle, PlayCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MyExamDoneBadge } from "@/components/education/exam-done-badge";
import { StartExamButton } from "@/components/education/start-exam-button";
import { initAdmin } from "@/lib/firebase-admin";
import { ExamSubjectCover } from "@/components/education/exam-cover";
import { EXAM_TYPE_CLASS, EXAM_TYPE_LABEL, examLevelOf, examTypeOf, type ExamType } from "@/lib/exam-labels";
import * as admin from "firebase-admin";

// ดึงข้อสอบจริงจาก Firestore collection `examSets`
// (mapping ชุดเดียวกับ /api/education/exams/[id] เพื่อให้หน้ารายละเอียด
//  กับหน้าทำข้อสอบแสดงข้อมูลตรงกัน)
type ExamDetail = Exam & { examType: ExamType; level: string; essayCount: number; multipleChoiceCount: number; session: string };

async function getExam(id: string): Promise<ExamDetail | null> {
    const app = await initAdmin();
    if (!app) return null;

    const doc = await admin.firestore().collection('examSets').doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    // แบบร่างยังไม่เผยแพร่ — ทำเหมือนไม่มีชุดนี้
    if (data.status === 'draft') return null;
    return {
        id: doc.id,
        title: data.title || '',
        description: data.description || data.instructions || '',
        price: 0,
        durationMinutes: data.timeLimitMinutes || 180,
        passingScore: data.passingScore ?? 50,
        totalQuestions: data.totalQuestions || data.essayCount || 0,
        category: data.subjectCode || data.category || 'other',
        difficulty: data.difficulty || 'medium',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        examType: examTypeOf(data),
        level: examLevelOf(data),
        essayCount: Number(data.essayCount) || 0,
        multipleChoiceCount: Number(data.multipleChoiceCount) || 0,
        session: data.session || '',
    } as ExamDetail;
}

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const exam = await getExam(id);
    if (!exam) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/exams" className="inline-flex items-center text-sm text-slate-500 hover:text-[#0B3979] transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                กลับไปหน้าคลังข้อสอบ
            </Link>

            <div className="bg-white border rounded-2xl p-8 shadow-sm overflow-hidden">
                {/* ภาพปกตามหมวดวิชา */}
                <div className="-mx-8 -mt-8 mb-6 aspect-[21/6] overflow-hidden">
                    <ExamSubjectCover subject={exam.title} size="lg" />
                </div>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        {/* ประเภทข้อสอบ + ระดับ — ให้เห็นชัดก่อนเริ่มทำ (เดิมขึ้น "อื่นๆ" กับ "ระดับ: MEDIUM") */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`rounded-lg px-3 py-1.5 text-sm font-medium border ${EXAM_TYPE_CLASS[exam.examType]}`}>
                                ข้อสอบ{EXAM_TYPE_LABEL[exam.examType]}
                                {exam.examType === 'mixed' && ` (ปรนัย ${exam.multipleChoiceCount} · อัตนัย ${exam.essayCount} ข้อ)`}
                            </span>
                            {exam.level && (
                                <span className="rounded-lg px-3 py-1.5 text-sm font-medium border bg-blue-50 text-[#082a5a] border-blue-200">
                                    {exam.level}
                                </span>
                            )}
                            {exam.session && (
                                <span className="rounded-lg px-3 py-1.5 text-sm border bg-white text-slate-600 border-slate-200">
                                    {exam.session}
                                </span>
                            )}
                        </div>
                        <div className="mb-4">
                            <MyExamDoneBadge examId={exam.id} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{exam.title}</h1>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {exam.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <Clock className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold text-slate-900">{exam.durationMinutes}</span>
                        <span className="text-sm text-slate-500">นาที</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <HelpCircle className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold text-slate-900">{exam.totalQuestions}</span>
                        <span className="text-sm text-slate-500">ข้อ</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <span className="text-2xl font-bold text-slate-900">{exam.passingScore}</span>
                        <span className="text-sm text-slate-500">คะแนนที่ผ่าน</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        ข้อตกลงและคำแนะนำ
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                        <li>โปรดเตรียมอุปกรณ์ให้พร้อม แนะนำให้ใช้คอมพิวเตอร์หรือแท็บเล็ต</li>
                        <li>ระบบจะจับเวลาทันทีเมื่อกดปุ่ม "เริ่มทำข้อสอบ"</li>
                        <li>เมื่อหมดเวลา ระบบจะส่งคำตอบโดยอัตโนมัติ</li>
                        <li>ห้ามเปิดตำราหรือค้นหาข้อมูลระหว่างสอบ (เพื่อประโยชน์ในการวัดผลตนเอง)</li>
                    </ul>
                </div>

                <div className="flex justify-center">
                    <StartExamButton
                        examId={id}
                        totalQuestions={exam.totalQuestions}
                        timeLimit={exam.durationMinutes}
                        passingScore={exam.passingScore}
                    />
                </div>
            </div>
        </div>
    );
}
