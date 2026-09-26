'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    const pathname = usePathname();
    // สไตล์ลิงก์เดียวกับ header เว็บหลัก: slate-600 → hover/active สีกรมท่า
    const linkClass = (href: string) =>
        pathname?.startsWith(href) ? 'font-bold text-[#0B3979]' : 'text-slate-600 hover:text-[#0B3979] transition-colors';

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
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium whitespace-nowrap">
                {NAV_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={linkClass(link.href)}
                    >
                        {link.label}
                    </Link>
                ))}
                {isMounted && user && (
                    <Link href="/my-learning" className={linkClass('/my-learning')}>
                        การเรียนรู้ของฉัน
                    </Link>
                )}
            </nav>

            {/* Mobile Menu */}
            <div className="lg:hidden">
                {isMounted && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                            <Menu className="h-5 w-5 text-slate-700" />
                            <span className="sr-only">เปิดเมนู</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                        <SheetHeader>
                            <SheetTitle className="text-left text-base font-bold text-[#0B3979]">Lawslane Wittaya</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 mt-5">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-base font-medium py-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-[#0B3979] transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isMounted && user && (
                                <Link
                                    href="/my-learning"
                                    className="text-base font-medium py-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-[#0B3979] transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    การเรียนรู้ของฉัน
                                </Link>
                            )}
                            <hr className="my-2 border-slate-100" />
                            <a
                                href="https://lawslane.com"
                                className="text-base font-medium py-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-[#0B3979] transition-colors"
                            >
                                ← กลับเว็บหลัก Lawslane
                            </a>
                            {isMounted && !user && (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-base font-medium py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        เข้าสู่ระบบ
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="text-base font-bold py-2.5 px-3 rounded-full bg-[#0B3979] text-white hover:bg-[#082a5a] transition-colors text-center"
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
