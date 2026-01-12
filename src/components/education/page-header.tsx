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
}

const THEMES = {
    indigo: 'bg-indigo-900 from-indigo-600 to-purple-600',
    emerald: 'bg-emerald-900 from-emerald-600 to-teal-600',
    amber: 'bg-amber-900 from-amber-600 to-orange-600',
    purple: 'bg-purple-900 from-purple-600 to-indigo-600',
    rose: 'bg-rose-900 from-rose-600 to-pink-600',
    slate: 'bg-slate-900 from-slate-700 to-slate-900',
    blue: 'bg-blue-900 from-blue-600 to-indigo-600',
    cyan: 'bg-cyan-900 from-cyan-600 to-blue-600'
};

const THEME_STYLES: Record<string, React.CSSProperties> = {
    indigo: { backgroundImage: 'linear-gradient(to right, #312e81, #581c87)', backgroundColor: '#312e81' },
    emerald: { backgroundImage: 'linear-gradient(to right, #059669, #0d9488)', backgroundColor: '#059669' },
    amber: { backgroundImage: 'linear-gradient(to right, #d97706, #ea580c)', backgroundColor: '#d97706' },
    purple: { backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)', backgroundColor: '#9333ea' },
    rose: { backgroundImage: 'linear-gradient(to right, #e11d48, #db2777)', backgroundColor: '#e11d48' },
    slate: { backgroundImage: 'linear-gradient(to right, #334155, #0f172a)', backgroundColor: '#334155' },
    blue: { backgroundImage: 'linear-gradient(to right, #2563eb, #4f46e5)', backgroundColor: '#2563eb' },
    cyan: { backgroundImage: 'linear-gradient(to right, #0891b2, #2563eb)', backgroundColor: '#0891b2' },
};

export function PageHeader({
    title,
    description,
    icon: iconProp,
    iconColor, // Remove default here, determine based on theme below
    theme = 'indigo',
    backLink,
    backLabel = 'กลับ',
    children,
    badge,
    badgeColor, // Remove default, determine below
}: PageHeaderProps) {
    const Icon = typeof iconProp === 'string' ? ICON_MAP[iconProp] : iconProp;

    // Define theme-specific colors for accents (instead of backgrounds)
    const themeColors = {
        indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
        amber: { text: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
        purple: { text: 'text-purple-600', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
        rose: { text: 'text-rose-600', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700' },
        slate: { text: 'text-slate-600', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700' },
        blue: { text: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        cyan: { text: 'text-cyan-600', bg: 'bg-cyan-50', badge: 'bg-cyan-100 text-cyan-700' },
    };

    const currentTheme = themeColors[theme] || themeColors.indigo;
    const finalIconColor = iconColor || currentTheme.text;
    const finalBadgeColor = badgeColor || currentTheme.badge;

    return (
        <div className="relative rounded-2xl p-6 md:p-8 mb-8 bg-white border border-slate-200 shadow-sm">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                {/* Back link */}
                {backLink && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            href={backLink}
                            className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {backLabel}
                        </Link>
                    </motion.div>
                )}

                <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon */}
                    {Icon && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className={`w-14 h-14 md:w-16 md:h-16 ${currentTheme.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-1`}
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
                                className="text-2xl md:text-3xl font-bold text-slate-900"
                            >
                                {title}
                            </motion.h1>

                            {badge && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${finalBadgeColor}`}
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

// Compact header variation
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
                    className="inline-flex items-center text-slate-600 hover:text-primary transition-colors mb-3 text-sm"
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
