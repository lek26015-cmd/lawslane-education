'use client';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, ThumbsUp, Zap } from 'lucide-react';

interface BookCardProps {
    id: string | number;
    title: string;
    coverUrl: string | StaticImageData;
    price: number;
    originalPrice?: number;
    description?: string;
    author?: string;
    level?: string;
    rating?: number; // 0-5
    badges?: Array<{ text: string; color: string; icon?: 'thumbs-up' | 'zap' }>;
    isEbook?: boolean;
    href?: string;
}

export function BookCard({
    id,
    title,
    coverUrl,
    price,
    originalPrice,
    rating = 5.0,
    description,
    author,
    level,
    badges = [],
    isEbook = false,
    href = '#'
}: BookCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow bg-white border-slate-200 overflow-hidden group">
            {/* Image Section */}
            <Link href={href}>
                <div className="relative aspect-[2/3] w-full bg-slate-100 overflow-hidden">
                    <Image
                        src={coverUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {isEbook && (
                        <Badge className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700">E-Book</Badge>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <CardContent className="flex-1 p-4 flex flex-col items-start text-left">
                {/* Badges */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {badges.map((badge, idx) => (
                            <Badge key={idx} variant="secondary" className={`text-[10px] h-5 ${badge.color.replace('text-', 'text-').replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${badge.color}`}>
                                {badge.icon === 'thumbs-up' && <ThumbsUp className="w-3 h-3 mr-1" />}
                                {badge.icon === 'zap' && <Zap className="w-3 h-3 mr-1" />}
                                {badge.text}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Title */}
                <Link href={href} className="w-full">
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 min-h-[3.5rem] text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {title}
                    </h3>
                </Link>

                {/* Description */}
                {description && (
                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Level */}
                {level && (
                    <Badge variant="outline" className="mb-3 text-xs font-normal text-slate-500 border-slate-300">
                        {level}
                    </Badge>
                )}

                {/* Author */}
                {author && (
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-auto pt-2">
                        <span className="font-medium">ผู้แต่ง:</span> {author}
                    </div>
                )}
            </CardContent>

            {/* Footer: Price & Action */}
            <CardFooter className="p-4 pt-0 flex items-center justify-between mt-auto border-t border-slate-50/50">
                <div className="flex flex-col items-start pt-4">
                    {originalPrice && (
                        <span className="text-xs text-slate-400 line-through">฿{originalPrice.toLocaleString()}</span>
                    )}
                    <span className="text-lg font-bold text-indigo-700">฿{price.toLocaleString()}</span>
                </div>
                <Link href={href} className="pt-4">
                    <Button
                        variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        ดูรายละเอียด
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
