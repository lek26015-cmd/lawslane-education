'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const EducationToaster = dynamic(
    () => import('./education-toaster').then((mod) => mod.EducationToaster),
    { ssr: false }
);

export function EducationToasterWrapper() {
    return <EducationToaster />;
}
