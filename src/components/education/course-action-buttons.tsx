'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Course } from '@/lib/education-types';
import { useRouter } from 'next/navigation';

interface CourseActionButtonsProps {
    course: Course;
}

export function CourseActionButtons({ course }: CourseActionButtonsProps) {
    const router = useRouter();

    const handleBuyNow = () => {
        // Direct checkout without adding to cart
        const params = new URLSearchParams({
            id: course.id,
            title: course.title,
            price: course.price.toString(),
            coverUrl: course.coverUrl,
            type: 'COURSE'
        });
        router.push(`/education/checkout?${params.toString()}`);
    };

    return (
        <div className="space-y-3">
            <Button
                onClick={handleBuyNow}
                className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
                สมัครเรียนเลย
            </Button>
            {/* <Button variant="outline" className="w-full">
                เพิ่มลงตะกร้า
            </Button> */}
        </div>
    );
}
