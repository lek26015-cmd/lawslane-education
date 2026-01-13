import React from 'react';
import { Course } from '@/lib/education-types';

interface CertificateTemplateProps {
    studentName: string;
    courseName: string;
    completionDate: Date;
    certificateId: string;
}

export function CertificateTemplate({ studentName, courseName, completionDate, certificateId }: CertificateTemplateProps) {
    return (
        <div className="w-full h-full bg-white text-slate-900 font-serif relative overflow-hidden flex flex-col items-center justify-center p-12 border-[20px] border-double border-indigo-900">

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <svg width="600" height="600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" />
                </svg>
            </div>

            {/* Header */}
            <div className="text-center space-y-2 mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                    {/* Lawlanes Logo Mockup */}
                    <div className="w-12 h-12 bg-indigo-900 text-white flex items-center justify-center rounded-lg font-bold text-2xl">L</div>
                    <span className="text-2xl font-bold text-indigo-900 tracking-widest uppercase font-sans">Lawlanes Education</span>
                </div>
                <h1 className="text-6xl font-bold text-indigo-900 uppercase tracking-widest">Certificate</h1>
                <p className="text-2xl text-slate-500 uppercase tracking-widest">of Completion</p>
            </div>

            {/* Content */}
            <div className="text-center space-y-8 max-w-4xl">
                <p className="text-xl text-slate-600 italic">This is to certify that</p>

                <h2 className="text-5xl font-bold text-indigo-700 border-b-2 border-indigo-100 pb-4 px-12 inline-block min-w-[400px]">
                    {studentName}
                </h2>

                <p className="text-xl text-slate-600 italic">has successfully completed the course</p>

                <h3 className="text-4xl font-bold text-slate-900">
                    {courseName}
                </h3>

                <p className="text-lg text-slate-500 mt-8">
                    Given this on {completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-20 w-full max-w-4xl flex justify-between items-end px-12">
                <div className="text-center">
                    <div className="h-16 flex items-end justify-center mb-2">
                        {/* Mock Signature */}
                        <span className="font-cursive text-3xl text-indigo-800 rotate-[-5deg] block">Thawi L.</span>
                    </div>
                    <div className="border-t border-slate-400 w-64 pt-2">
                        <p className="font-bold text-slate-900">Thawit Lert</p>
                        <p className="text-sm text-slate-500 uppercase tracking-wider">Head of Education</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-400">Certificate ID: {certificateId}</p>
                    <p className="text-xs text-slate-400">Verify at: lawlanes.com/verify/{certificateId}</p>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-[20px] border-l-[20px] border-indigo-900/20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-[20px] border-r-[20px] border-indigo-900/20"></div>
        </div>
    );
}
