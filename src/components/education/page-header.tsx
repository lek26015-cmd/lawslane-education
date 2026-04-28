'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, LucideIcon, BookOpen, GraduationCap, Award, Settings, FileText, ShoppingBag, PlayCircle } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
    BookOpen,
    GraduationCap,
    Award,
    Settings,
    FileText,
    ShoppingBag,
    PlayCircle
};

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon | string;
    iconColor?: string;
    backLink?: string;
    backLabel?: string;
    children?: ReactNode;
    badge?: string;
    badgeColor?: string;
    theme?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate' | 'blue' | 'cyan';
    variant?: 'gradient' | 'minimal';
}

const THEME_GRADIENTS = {
    indigo: 'from-indigo-900 via-indigo-800 to-slate-900',
    emerald: 'from-emerald-900 via-emerald-800 to-slate-900',
    amber: 'from-amber-800 via-amber-700 to-slate-900',
    purple: 'from-purple-900 via-indigo-900 to-slate-900',
    rose: 'from-rose-900 via-pink-800 to-slate-900',
    slate: 'from-slate-800 via-slate-700 to-slate-900',
    blue: 'from-blue-900 via-indigo-800 to-slate-900',
    cyan: 'from-cyan-900 via-blue-800 to-slate-900'
};

export function PageHeader({
    title,
    description,
    icon: iconProp,
    iconColor,
    theme = 'purple',
    variant = 'gradient',
    backLink,
    backLabel = 'กลับ',
    children,
    badge,
    badgeColor,
}: PageHeaderProps) {
    const Icon = typeof iconProp === 'string' ? ICON_MAP[iconProp] : iconProp;

    // Minimal variant - white background with purple/slate text
    if (variant === 'minimal') {
        return (
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {backLink && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link
                                href={backLink}
                                className="inline-flex items-center text-slate-500 hover:text-purple-600 transition-colors mb-4 text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {backLabel}
                            </Link>
                        </motion.div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {Icon && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                className="w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0"
                            >
                                <Icon className={`w-7 h-7 md:w-8 md:h-8 ${iconColor || 'text-purple-600'}`} />
                            </motion.div>
                        )}

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl md:text-3xl font-bold text-slate-900"
                                >
                                    {title}
                                </motion.h1>

                                {badge && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.25 }}
                                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor || 'bg-purple-100 text-purple-700'}`}
                                    >
                                        {badge}
                                    </motion.span>
                                )}
                            </div>

                            {description && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-slate-500 text-sm md:text-base max-w-3xl leading-relaxed"
                                >
                                    {description}
                                </motion.p>
                            )}
                        </div>

                        {children && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex-shrink-0"
                            >
                                {children}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Gradient variant (default) - dark background with white text
    const containerClasses = `relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 shadow-xl text-white bg-gradient-to-br ${THEME_GRADIENTS[theme] || THEME_GRADIENTS.purple}`;

    const finalIconColor = iconColor || 'text-white';
    const defaultBadgeClasses = 'bg-white/20 text-white border-0 backdrop-blur-sm';
    const finalBadgeClasses = badgeColor || defaultBadgeClasses;

    return (
        <div className={containerClasses}>
            {/* Background decoration - matching exams page */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <div className="absolute top-10 right-10 w-48 h-48 bg-purple-500 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                {/* Back link - White text now */}
                {backLink && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            href={backLink}
                            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-4 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {backLabel}
                        </Link>
                    </motion.div>
                )}

                <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon - White container with transparency */}
                    {Icon && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className={`w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm`}
                        >
                            <Icon className={`w-7 h-7 md:w-8 md:h-8 ${finalIconColor}`} />
                        </motion.div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl md:text-3xl font-bold text-white shadow-sm"
                            >
                                {title}
                            </motion.h1>

                            {badge && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${finalBadgeClasses}`}
                                >
                                    {badge}
                                </motion.span>
                            )}
                        </div>

                        {description && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-blue-50/90 text-sm md:text-base max-w-3xl leading-relaxed font-light"
                            >
                                {description}
                            </motion.p>
                        )}
                    </div>

                    {/* Optional children (actions, filters, etc.) */}
                    {children && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex-shrink-0 pt-2"
                        >
                            {children}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// Compact header variation - keeping default style but potentially updated if needed
// For now, assume this is for internal smaller headers and might want to stay white or simple.
// But if user wants "Banner" to be purple, and this is a "PageHeader", maybe I should update this too?
// The user said "Banner", likely referring to the big one. Compact header usually just title.
// I will keep it simple for now, but maybe add text capability. 
interface CompactPageHeaderProps {
    title: string;
    description?: string;
    backLink?: string;
    backLabel?: string;
}

export function CompactPageHeader({
    title,
    description,
    backLink,
    backLabel = 'กลับ'
}: CompactPageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
        >
            {backLink && (
                <Link
                    href={backLink}
                    className="inline-flex items-center text-slate-600 hover:text-purple-600 transition-colors mb-3 text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backLabel}
                </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
            {description && (
                <p className="text-slate-600 mt-1">{description}</p>
            )}
        </motion.div>
    );
}
