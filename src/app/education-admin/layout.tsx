'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    GraduationCap,
    Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const NAV_ITEMS = [
        { href: '/education-admin', label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard },
        { href: '/education-admin/articles', label: 'จัดการบทความ', icon: FileText },
        { href: '/education-admin/courses', label: 'จัดการคอร์สเรียน', icon: GraduationCap },
        { href: '/education-admin/books', label: 'จัดการหนังสือ', icon: BookOpen },
        { href: '/education-admin/users', label: 'ผู้ใช้งาน', icon: Users },
        { href: '/education-admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },
    ];

    const isActive = (path: string) => {
        if (path === '/education-admin') return pathname === path;
        return pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                        <GraduationCap className="w-8 h-8 text-indigo-500 mr-3" />
                        <div>
                            <h1 className="font-bold text-white leading-none">Lawslane</h1>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Admin Panel</span>
                        </div>
                        <button
                            className="lg:hidden ml-auto text-slate-400"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group mb-1 ${active
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-9 h-9 border border-indigo-500/50">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-indigo-900 text-indigo-200">AD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Admin User</p>
                                <p className="text-xs text-slate-500 truncate">admin@lawlanes.com</p>
                            </div>
                        </div>
                        <Link href="/" className="mb-2 block">
                            <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white h-9 text-xs">
                                <Globe className="w-3 h-3 mr-2" />
                                กลับสู่หน้าหลัก
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white h-9 text-xs">
                            <LogOut className="w-3 h-3 mr-2" />
                            ออกจากระบบ
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b h-16 flex items-center justify-between px-4 lg:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="font-bold text-slate-900">Admin Panel</span>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
