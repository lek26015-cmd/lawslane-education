
'use client';

import Link from 'next/link';
import { useUser as useAuthUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, LayoutDashboard, Home } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function EducationHeaderActions() {
    const { user, isUserLoading } = useAuthUser();
    const { auth } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            toast({
                title: "ออกจากระบบแล้ว",
                description: "ขอบคุณที่ใช้บริการ Lawslane Wittaya",
            });
            router.push('/login');
        }
    };

    if (isUserLoading) return null;

    if (!user) {
        return (
            <div className="hidden lg:flex items-center gap-2">
                <Link
                    href="/signup"
                    className="text-sm font-medium text-slate-700 hover:text-[#0B3979] px-3 transition-colors"
                >
                    สมัครสมาชิก
                </Link>
                {/* ปุ่มเข้าสู่ระบบแบบเดียวกับ header เว็บหลัก */}
                <Link
                    href="/login"
                    className="rounded-full px-8 h-10 inline-flex items-center font-bold text-white bg-[#0B3979] hover:bg-[#082a5a] shadow-lg transition-all hover:scale-105"
                >
                    เข้าสู่ระบบ
                </Link>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B3979]/40">
                    <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                        <AvatarFallback className="text-xs font-normal bg-blue-50 text-[#0B3979]">
                            {user.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-slate-500">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/my-learning')} className="text-sm">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    การเรียนรู้ของฉัน
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')} className="text-sm">
                    <User className="mr-2 h-4 w-4" />
                    จัดการบัญชี
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { window.location.href = 'https://lawslane.com'; }} className="text-sm">
                    <Home className="mr-2 h-4 w-4" />
                    กลับเว็บหลัก Lawslane
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
