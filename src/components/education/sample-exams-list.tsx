import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

async function getRecentExams() {
    try {
        const app = await initAdmin();
        if (!app) return [];
        const db = admin.firestore();
        const snap = await db.collection('examSets')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        
        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                totalQuestions: data.totalQuestions || data.essayCount || 0,
                category: data.category || '',
                subjectCode: data.subjectCode || '',
                session: data.session || '',
            };
        });
    } catch (e) {
        console.error('Error fetching exams for home:', e);
        return [];
    }
}

function mapCategory(cat: string, code: string): string {
    if (cat === 'year1') return 'ชั้นปี 1';
    if (cat === 'year2') return 'ชั้นปี 2';
    if (cat === 'year3') return 'ชั้นปี 3';
    if (cat === 'year4') return 'ชั้นปี 4';
    if (cat === 'other') return 'ตั๋วทนาย';
    if (!code) return 'ข้อสอบ';
    const num = parseInt(code.replace(/\D/g, '').substring(0, 4));
    if (num >= 1001 && num <= 1004) return 'ชั้นปี 1';
    if (num >= 2001 && num <= 2032) return 'ชั้นปี 2';
    if (num >= 3001 && num <= 3035) return 'ชั้นปี 3';
    if (num >= 4001 && num <= 4999) return 'ชั้นปี 4';
    return 'ข้อสอบ';
}

export async function SampleExamsList() {
    const exams = await getRecentExams();

    if (exams.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ยังไม่มีข้อสอบในขณะนี้</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam, idx) => (
                <Link
                    key={exam.id}
                    href={`/exams/${exam.id}/take`}
                    className="group flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-[#0B3979] flex items-center justify-center">
                        <FileText className="w-10 h-10 text-white/60" />
                        <div className="absolute top-0 left-0 bg-[#0B3979] text-[10px] text-white px-2 py-0.5 font-bold">
                            ฟรี
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#0B3979] bg-blue-50 px-2 py-0.5 rounded-full">
                                {mapCategory(exam.category, exam.subjectCode)}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-[#082a5a] transition-colors line-clamp-2">
                            {exam.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {exam.totalQuestions} ข้อ
                            </span>
                            {exam.session && <span>{exam.session}</span>}
                        </div>
                    </div>
                    <div className="flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
