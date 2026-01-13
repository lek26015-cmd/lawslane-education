'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Course } from '@/lib/education-types';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PlayCircle, ShoppingCart } from 'lucide-react';

interface CourseActionButtonsProps {
    course: Course;
}

export function CourseActionButtons({ course }: CourseActionButtonsProps) {
    const router = useRouter();
    const { user } = useUser();
    const [isOwned, setIsOwned] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Default false to avoid flickering loading state if not logged in immediately

    useEffect(() => {
        let isMounted = true;

        async function checkOwnership() {
            if (!user) {
                if (isMounted) setIsOwned(false);
                return;
            }

            try {
                // Determine effective user ID (support for test mode bypass)
                const effectiveUserId = user?.uid || 'user-123';

                // Use the API route to match MyLearning page logic exactly
                const response = await fetch(`/api/education/my-ebooks?userId=${effectiveUserId}`);
                if (response.ok) {
                    const ownedItems = await response.json();

                    // Check if owned
                    const hasCourse = ownedItems.some((item: any) =>
                        (item.id === course.id || item.title === course.title) &&
                        (item.type === 'COURSE')
                    );

                    if (isMounted) setIsOwned(hasCourse);
                }
            } catch (error) {
                console.error("Failed to check ownership", error);
            }
        }

        checkOwnership();

        return () => { isMounted = false; };
    }, [user, course.id, course.title]);

    const handleBuyNow = () => {
        // Direct checkout without adding to cart
        const params = new URLSearchParams({
            id: course.id,
            title: course.title,
            price: course.price.toString(),
            coverUrl: course.coverUrl,
            type: 'COURSE'
        });
        router.push(`/checkout?${params.toString()}`);
    };

    if (isOwned) {
        return (
            <div className="space-y-3">
                <Button
                    onClick={() => router.push(`/courses/${course.id}/learn`)}
                    className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    เข้าเรียนทันที
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Button
                onClick={handleBuyNow}
                className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
                สมัครเรียนเลย
            </Button>
            {/* <Button variant="outline" className="w-full">
                เพิ่มลงตะกร้า <ShoppingCart className="w-4 h-4 ml-2" />
            </Button> */}
        </div>
    );
}
