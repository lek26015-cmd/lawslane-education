
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCourseById } from '@/lib/education-data-admin';
import { CertificateTemplate } from '@/components/education/certificate-template';
// Cannot use 'useUser' directly in server component for data, need client wrapper or use admin sdk to fetch user name
// For simplicity in this demo, we'll assume the user is logged in client side or use a client component wrapper.
// Actually, to make printing easy, let's make this page a Client Component 
// OR fetch data server side and pass to Client Component Wrapper.

// Let's go with a Server Component that renders a Client Wrapper for the Print Button, 
// but we need the user's name.

import { CertificatePageContent } from '@/components/education/certificate-page-content';

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;

    // 1. Fetch Course
    const course = await getCourseById(courseId);
    if (!course) notFound();

    return <CertificatePageContent course={course} />;
}
