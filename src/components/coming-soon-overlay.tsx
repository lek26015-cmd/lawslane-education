'use client';

import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonOverlay({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center px-6 max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Construction className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{title}</h1>
        <p className="text-lg text-slate-500 mb-8">Coming Soon — เร็วๆ นี้</p>
        <p className="text-sm text-slate-400 mb-8">
          เรากำลังพัฒนาส่วนนี้อยู่ กรุณาติดตามอัปเดตได้ทาง Lawslane
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
