'use client';

import React, { useRef } from 'react';
import { useUser } from '@/firebase';
import { Course } from '@/lib/education-types';
import { CertificateTemplate } from './certificate-template';
import { Button } from '@/components/ui/button';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    course: Course;
}

export function CertificatePageContent({ course }: Props) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    if (isUserLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) {
        // Simple protection
        return <div className="min-h-screen flex items-center justify-center">Please log in to view certificate.</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Toolbar - Hidden when printing */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between print:hidden sticky top-0 z-50">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Certificate Preview Area */}
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center print:p-0 print:block">
                <div className="bg-white shadow-2xl w-[297mm] h-[210mm] print:w-full print:h-full print:shadow-none mx-auto transform scale-75 md:scale-100 origin-center transition-transform">
                    <CertificateTemplate
                        studentName={user.displayName || user.email || 'Student Name'}
                        courseName={course.title}
                        completionDate={new Date()}
                        certificateId={`CERT-${course.id.substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 10000)}`}
                    />
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Hide everything else if needed, but normally route isolation is enough */
                }
            `}</style>
        </div>
    );
}
