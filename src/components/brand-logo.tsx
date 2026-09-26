import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
    variant?: 'light' | 'dark';
    subtitle?: string;
    showSubtitle?: boolean;
    className?: string;
    isUppercase?: boolean;
}

// หน้าตาเดียวกับโลโก้เว็บหลัก (Lawslane/src/components/logo.tsx): รูปโลโก้ + "Lawslane" ตัวหนา
// + บรรทัดเล็กใต้ชื่อบอกผลิตภัณฑ์ ("wittaya" แบบเดียวกับ "lawyer portal" ของหลังบ้านทนาย)
export function BrandLogo({
    variant = 'light',
    subtitle = 'แพลตฟอร์มการศึกษาและคลังข้อสอบกฎหมาย',
    showSubtitle = true,
    className = '',
    isUppercase = false,
}: BrandLogoProps) {
    const isDark = variant === 'dark';

    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            <Image
                src={isDark ? '/images/logo-lawslane-transparent-white.png' : '/images/logo-lawslane-transparent-color.png'}
                alt="Lawslane Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
                priority
            />
            <div className="flex flex-col">
                <span className={`text-xl font-bold leading-none ${isDark ? 'text-white' : 'text-[#0B3979]'}`}>
                    {isUppercase ? 'LAWSLANE' : 'Lawslane'}
                </span>
                <span className={`text-[10px] font-bold tracking-widest mt-0.5 leading-none ${isDark ? 'text-white/60' : 'text-blue-600'}`}>
                    WITTAYA
                </span>
                {showSubtitle && (
                    <span className={`text-[10px] mt-1 leading-tight ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
}

export default BrandLogo;
