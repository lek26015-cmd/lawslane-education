'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand-logo';
import EducationNavigation from '@/components/education/education-nav';
import { EducationHeaderActions } from '@/components/education/header-actions';

// Header แบบเว็บหลัก lawslane.com: หน้าแรกโปร่งใสทับ hero พื้นเข้ม แล้วกลับเป็นพื้นขาวเมื่อเลื่อนลงเกิน 50px
// หน้าอื่นเป็นพื้นขาวตลอด
export function EducationHeader() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (!isHomePage) return;
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    const transparent = isHomePage && !isScrolled;

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b transition-colors duration-300',
                transparent
                    ? 'bg-transparent text-white border-transparent'
                    : 'bg-white/95 text-slate-900 border-slate-200 shadow-sm backdrop-blur-md'
            )}
        >
            <div className="mx-auto max-w-6xl px-4 md:px-6 h-20 flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center shrink-0">
                    <BrandLogo variant={transparent ? 'dark' : 'light'} showSubtitle={false} />
                </Link>
                <div className="flex items-center gap-4">
                    <EducationNavigation transparent={transparent} />
                    <EducationHeaderActions transparent={transparent} />
                </div>
            </div>
        </header>
    );
}
