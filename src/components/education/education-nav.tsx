'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

export default function EducationNavigation() {
    const { user } = useUser();
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const NAV_LINKS = [
        { href: "/exams", label: "คลังข้อสอบ" },
        { href: "/books", label: "หนังสือ" },
        { href: "/courses", label: "คอร์สเรียน" },
        { href: "/articles", label: "บทความ" },
        { href: "/pricing", label: "แพ็กเกจ" },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-light">
                {NAV_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-white/85 hover:text-sky-200 transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
                {isMounted && user && (
                    <Link href="/my-learning" className="text-white/85 hover:text-sky-200 transition-colors">
                        การเรียนรู้ของฉัน
                    </Link>
                )}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
                {isMounted && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                            <Menu className="h-5 w-5 text-white/85" />
                            <span className="sr-only">เปิดเมนู</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                        <SheetHeader>
                            <SheetTitle className="text-left text-sm font-normal text-slate-900">เมนู</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 mt-5">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-light py-2.5 px-3 rounded-lg text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isMounted && user && (
                                <Link
                                    href="/my-learning"
                                    className="text-sm font-light py-2.5 px-3 rounded-lg text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    การเรียนรู้ของฉัน
                                </Link>
                            )}
                            <hr className="my-2 border-slate-100" />
                            {isMounted && !user && (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-light py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        เข้าสู่ระบบ
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="text-sm font-normal py-2.5 px-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        สมัครสมาชิก
                                    </Link>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
                )}
            </div>
        </>
    );
}
