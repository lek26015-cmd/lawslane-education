import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
    variant?: 'light' | 'dark';
    subtitle?: string;
    showSubtitle?: boolean;
    className?: string;
    isUppercase?: boolean;
}

export function BrandLogo({
    variant = 'light',
    subtitle = 'แพลตฟอร์มการศึกษาและคลังข้อสอบกฎหมาย',
    showSubtitle = true,
    className = '',
    isUppercase = false,
}: BrandLogoProps) {
    const isDark = variant === 'dark';

    return (
        <div className={`flex items-center gap-2.5 select-none ${className}`}>
            {/* Logo Icon */}
            <div
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center p-1.5 transition-transform hover:scale-105 flex-shrink-0 ${
                    isDark
                        ? 'bg-slate-800 border border-sky-400/50'
                        : 'bg-sky-50 border border-sky-200'
                }`}
            >
                <Image
                    src={isDark ? '/images/logo-lawslane-transparent-white.png' : '/images/logo-lawslane-transparent-color.png'}
                    alt="Lawslane Logo"
                    width={28}
                    height={28}
                    className="w-5 h-5 object-contain"
                    priority
                />
            </div>

            {/* Brand Text */}
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`text-base font-normal tracking-tight leading-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                        {isUppercase ? 'LAWSLANE' : 'Lawslane'}
                    </span>

                    <span
                        className={`text-[10px] font-normal px-2 py-0.5 rounded-md border leading-tight ${
                            isDark
                                ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                                : 'border-sky-200 bg-sky-50 text-sky-600'
                        }`}
                    >
                        {isUppercase ? 'WITTAYA' : 'Wittaya'}
                    </span>
                </div>

                {/* Subtitle */}
                {showSubtitle && (
                    <span
                        className={`text-[10px] font-extralight tracking-tight mt-0.5 leading-tight ${
                            isDark ? 'text-slate-400' : 'text-slate-400'
                        }`}
                    >
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
}

export default BrandLogo;
