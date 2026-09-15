
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
import { LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
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
            <div className="hidden md:flex items-center gap-2">
                <Link
                    href="/login"
                    className="text-xs text-white/85 hover:text-sky-200 font-light transition-colors"
                >
                    เข้าสู่ระบบ
                </Link>
                <Link
                    href="/signup"
                    className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 text-xs font-normal transition-colors"
                >
                    สมัครสมาชิก
                </Link>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <Avatar className="h-8 w-8 border border-sky-700">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                        <AvatarFallback className="text-xs font-normal bg-sky-50 text-sky-700">
                            {user.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-normal leading-none">{user.displayName}</p>
                        <p className="text-[11px] leading-none text-slate-500 font-extralight">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/my-learning')} className="text-xs font-light">
                    <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                    การเรียนรู้ของฉัน
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')} className="text-xs font-light">
                    <User className="mr-2 h-3.5 w-3.5" />
                    จัดการบัญชี
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/education-admin')} className="text-xs font-light">
                    <Shield className="mr-2 h-3.5 w-3.5" />
                    ระบบจัดการ (Admin)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-xs font-light text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    ออกจากระบบ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
