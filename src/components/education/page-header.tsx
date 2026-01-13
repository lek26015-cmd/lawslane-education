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

const THEME_GRADIENTS = {
    indigo: 'bg-gradient-to-r from-indigo-600 to-violet-600',
    emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-600',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-600', // The requested one
    rose: 'bg-gradient-to-r from-rose-600 to-pink-600',
    slate: 'bg-gradient-to-r from-slate-700 to-slate-900',
    blue: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    cyan: 'bg-gradient-to-r from-cyan-600 to-blue-600'
};

export function PageHeader({
    title,
    description,
    icon: iconProp,
    iconColor,
    theme = 'purple', // Default is now purple as requested
    backLink,
    backLabel = 'กลับ',
    children,
    badge,
    badgeColor,
}: PageHeaderProps) {
    const Icon = typeof iconProp === 'string' ? ICON_MAP[iconProp] : iconProp;

    // We now use a dark background (gradient), so text is white.
    // Icon background should be semi-transparent white.
    const containerClasses = `relative rounded-2xl p-6 md:p-8 mb-8 shadow-md text-white ${THEME_GRADIENTS[theme] || THEME_GRADIENTS.purple}`;

    // For icon color, if not specified, we use white or a variation.
    // Actually on a colored banner, white icon looks best.
    const finalIconColor = iconColor || 'text-white';

    // Badge logic: standard white badge with colored text usually looks good on gradients,
    // or a semi-transparent white badge.
    const defaultBadgeClasses = 'bg-white/20 text-white border border-white/20 backdrop-blur-sm';
    const finalBadgeClasses = badgeColor || defaultBadgeClasses;

    return (
        <div className={containerClasses}>
            {/* Background Pattern overlay (optional, for texture) */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-2xl pointer-events-none"></div>

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
