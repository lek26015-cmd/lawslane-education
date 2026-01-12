'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/firebase';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

export default function EducationNavigation() {
    // Navigation for Education Portal
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const NAV_LINKS = [
        { href: "/education/exams", label: "คลังข้อสอบ" },
        { href: "/education/books", label: "หนังสือ" },
        { href: "/education/courses", label: "คอร์สเรียน" },
        { href: "/education/articles", label: "บทความ" },
    ];

    return (
        <>
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium" suppressHydrationWarning>
                {NAV_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                ))}
                {user && (
                    <Link href="/my-learning" className="hover:text-primary transition-colors">การเรียนรู้ของฉัน</Link>
                )}
            </nav>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">เปิดเมนู</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                        <SheetHeader>
                            <SheetTitle className="text-left">เมนู</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-4 mt-6">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-lg font-medium py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    href="/my-learning"
                                    className="text-lg font-medium py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    การเรียนรู้ของฉัน
                                </Link>
                            )}
                            <hr className="my-2 border-slate-200" />
                            {!user && (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-lg font-medium py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        เข้าสู่ระบบ
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="text-lg font-medium py-2 px-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        สมัครสมาชิก
                                    </Link>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
